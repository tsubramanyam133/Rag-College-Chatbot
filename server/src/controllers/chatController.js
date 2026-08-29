const ragService = require('../services/ragService');
const aiService = require('../services/aiService');
const analyticsService = require('../services/analyticsService');
const { memoryDb } = require('../config/db');

exports.askQuestion = async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      query,
      sessionId,
      departmentFilter = 'All',
      categoryFilter = 'All',
      strictGrounding = true
    } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ error: 'Query string is required.' });
    }

    const userId = req.user ? req.user.id : 'anonymous';
    const userName = req.user ? req.user.name : 'Student Guest';

    // 1. Find or create session
    let session = memoryDb.sessions.find(s => s.id === sessionId && (s.userId === userId || userId === 'anonymous'));
    if (!session) {
      session = {
        id: sessionId || `ses-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        userId,
        title: query.length > 35 ? query.substring(0, 35) + '...' : query,
        department: departmentFilter,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.sessions.unshift(session);
    } else {
      session.updatedAt = new Date().toISOString();
    }

    // 2. Fetch recent conversation history
    const sessionMessages = memoryDb.messages
      .filter(m => m.sessionId === session.id)
      .slice(-6);

    // 3. RAG Step: Hybrid Semantic Vector Search
    const searchResult = ragService.searchSimilarChunks(query, {
      departmentFilter,
      categoryFilter,
      threshold: memoryDb.systemSettings.similarityThreshold || 0.20,
      topK: memoryDb.systemSettings.topK || 4
    });

    // 4. Grounded AI Generation
    const aiResult = await aiService.generateAnswer(
      query,
      searchResult.results,
      sessionMessages
    );

    const responseTimeMs = Date.now() - startTime;

    // 5. Log Analytics Event
    const analyticsEntry = analyticsService.logQueryEvent({
      query,
      department: departmentFilter !== 'All' ? departmentFilter : (searchResult.results[0]?.department || 'General'),
      category: categoryFilter !== 'All' ? categoryFilter : (searchResult.results[0]?.category || 'General'),
      topScore: searchResult.topScore,
      isGrounded: aiResult.isGrounded,
      sourcesCount: aiResult.sources.length,
      responseTimeMs,
      userId,
      userName
    });

    // 6. Save User message and AI message to history
    const userMessageId = `msg-${Date.now()}-u`;
    const aiMessageId = `msg-${Date.now()}-ai`;

    const userMessage = {
      id: userMessageId,
      sessionId: session.id,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    const botMessage = {
      id: aiMessageId,
      sessionId: session.id,
      role: 'assistant',
      content: aiResult.answer,
      sources: aiResult.sources,
      confidenceScore: aiResult.confidenceScore,
      isGrounded: aiResult.isGrounded,
      provider: aiResult.provider,
      model: aiResult.model,
      analyticsEventId: analyticsEntry.id,
      responseTimeMs,
      timestamp: new Date().toISOString()
    };

    memoryDb.messages.push(userMessage, botMessage);
    memoryDb.saveSnapshot();

    res.json({
      sessionId: session.id,
      answer: aiResult.answer,
      sources: aiResult.sources,
      confidenceScore: aiResult.confidenceScore,
      isGrounded: aiResult.isGrounded,
      provider: aiResult.provider,
      model: aiResult.model,
      responseTimeMs,
      analyticsEventId: analyticsEntry.id,
      messageId: aiMessageId
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: 'An error occurred while processing your question: ' + err.message
    });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'anonymous';
    const sessions = memoryDb.sessions.filter(s => s.userId === userId || userId === 'anonymous');
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching sessions' });
  }
};

exports.createSession = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'anonymous';
    const { title = 'New Conversation', department = 'All' } = req.body;

    const newSession = {
      id: `ses-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      title,
      department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryDb.sessions.unshift(newSession);
    memoryDb.saveSnapshot();

    res.status(201).json({ session: newSession });
  } catch (err) {
    res.status(500).json({ error: 'Error creating session' });
  }
};

exports.getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = memoryDb.messages.filter(m => m.sessionId === sessionId);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

exports.renameSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    const session = memoryDb.sessions.find(s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.title = title.trim();
    session.updatedAt = new Date().toISOString();
    memoryDb.saveSnapshot();

    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Error updating session' });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    memoryDb.sessions = memoryDb.sessions.filter(s => s.id !== sessionId);
    memoryDb.messages = memoryDb.messages.filter(m => m.sessionId !== sessionId);
    memoryDb.saveSnapshot();

    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting session' });
  }
};

exports.recordFeedback = async (req, res) => {
  try {
    const { eventId, feedback, feedbackNote } = req.body;
    if (!eventId || !feedback) {
      return res.status(400).json({ error: 'EventId and feedback (up/down) are required' });
    }

    const updated = analyticsService.recordFeedback(eventId, feedback, feedbackNote);
    if (!updated) {
      return res.status(404).json({ error: 'Analytics event not found' });
    }

    res.json({ message: 'Feedback recorded successfully', event: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error recording feedback' });
  }
};

exports.getSuggestedPrompts = async (req, res) => {
  try {
    const defaultPrompts = [
      { category: 'Admissions', prompt: 'What are the eligibility criteria and cutoff ranks for B.Tech CSE?' },
      { category: 'Fees', prompt: 'What is the annual tuition fee and are there any scholarship schemes?' },
      { category: 'Academics', prompt: 'What is the mandatory attendance percentage policy for exams?' },
      { category: 'Hostel & Mess', prompt: 'What are the hostel entry curfew timings and room charges?' },
      { category: 'Placements', prompt: 'What was the highest and average package in campus placements?' },
      { category: 'Library & Clubs', prompt: 'What are the central library timings and student technical clubs?' }
    ];

    res.json({ prompts: defaultPrompts });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching prompts' });
  }
};
