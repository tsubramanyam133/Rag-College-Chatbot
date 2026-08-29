const axios = require('axios');
const env = require('../config/env');
const { memoryDb } = require('../config/db');

class AIService {
  // Generate grounded RAG response
  async generateAnswer(userQuery, retrievedChunks, conversationHistory = [], options = {}) {
    const settings = memoryDb.systemSettings;
    const geminiKey = options.geminiApiKey || settings.geminiApiKey || env.GEMINI_API_KEY;
    const openrouterKey = options.openrouterApiKey || settings.openrouterApiKey || env.OPENROUTER_API_KEY;

    // Check if relevant context exists
    if (!retrievedChunks || retrievedChunks.length === 0) {
      return {
        answer: `I could not find any specific information regarding **"${userQuery}"** in the uploaded college knowledge base and official documents.\n\n` +
          `**Suggestions:**\n` +
          `- Please check if your question relates to Admissions, Fees, Academics, Hostel, Placements, or Campus Facilities.\n` +
          `- Try rephrasing your search terms (e.g. *"Hostel curfew"* or *"B.Tech CSE fees"*).\n` +
          `- You can also click **"Submit for Admin Review"** below to ask the college administration to add this topic!`,
        sources: [],
        confidenceScore: 0,
        isGrounded: false,
        provider: 'context-fallback',
        model: 'heuristic-guardrail'
      };
    }

    // Assemble structured context block with numbered citations
    const contextText = retrievedChunks
      .map((chk, idx) => `[Source ${idx + 1}: ${chk.documentTitle} (${chk.category} / ${chk.department})]\n${chk.text}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are "CampusBrain AI", the official intelligent College Information Assistant.
Your mission is to provide accurate, polite, structured, and helpful answers to students, parents, and faculty based EXCLUSIVELY on the retrieved college documents provided in the context below.

CRITICAL RULES:
1. Base your answer strictly on the provided context. If a detail (such as specific dates or fees) is not mentioned in the context, explicitly state that it is not specified in the current official records.
2. Structure your answer using clear Markdown headings, bullet points, and bold text for readability.
3. At the end of relevant points or sections, cite the source using [Source 1], [Source 2], etc.
4. If the user asks a greeting (e.g., "Hello", "Hi"), warmly introduce yourself and list topics you can help with (Admissions, Fees, Exams, Hostel, Placements, Library).
5. Always maintain a professional, encouraging, and student-friendly tone.`;

    const userPrompt = `CONTEXT INFORMATION FROM OFFICIAL COLLEGE DOCUMENTS:
${contextText}

CONVERSATION HISTORY:
${conversationHistory.slice(-4).map(m => `${m.role === 'user' ? 'Student' : 'CampusBrain'}: ${m.content}`).join('\n')}

STUDENT'S CURRENT QUESTION:
${userQuery}

Please answer the student's question accurately using the context above. Cite the source names where appropriate.`;

    // Try Google Gemini API if key is available
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        const response = await this.callGemini(geminiKey, systemPrompt, userPrompt);
        return {
          answer: response,
          sources: retrievedChunks.map((c, i) => ({
            id: c.id,
            sourceNumber: i + 1,
            title: c.documentTitle,
            category: c.category,
            department: c.department,
            textSnippet: c.text.substring(0, 180) + '...',
            fullText: c.text,
            score: c.score
          })),
          confidenceScore: retrievedChunks[0].score,
          isGrounded: true,
          provider: 'Google Gemini',
          model: settings.modelName || 'gemini-1.5-flash'
        };
      } catch (geminiErr) {
        console.warn('⚠️ Gemini API call failed:', geminiErr.message, 'Falling back to alternative provider/deterministic engine.');
      }
    }

    // Try OpenRouter API if key is available
    if (openrouterKey && openrouterKey.trim() !== '') {
      try {
        const response = await this.callOpenRouter(openrouterKey, systemPrompt, userPrompt);
        return {
          answer: response,
          sources: retrievedChunks.map((c, i) => ({
            id: c.id,
            sourceNumber: i + 1,
            title: c.documentTitle,
            category: c.category,
            department: c.department,
            textSnippet: c.text.substring(0, 180) + '...',
            fullText: c.text,
            score: c.score
          })),
          confidenceScore: retrievedChunks[0].score,
          isGrounded: true,
          provider: 'OpenRouter',
          model: 'openai/gpt-4o-mini'
        };
      } catch (orErr) {
        console.warn('⚠️ OpenRouter API call failed:', orErr.message);
      }
    }

    // High-Quality Grounded Semantic Extractor (Zero-config offline mode)
    const localSynthesizedAnswer = this.synthesizeLocalAnswer(userQuery, retrievedChunks);
    return {
      answer: localSynthesizedAnswer,
      sources: retrievedChunks.map((c, i) => ({
        id: c.id,
        sourceNumber: i + 1,
        title: c.documentTitle,
        category: c.category,
        department: c.department,
        textSnippet: c.text.substring(0, 180) + '...',
        fullText: c.text,
        score: c.score
      })),
      confidenceScore: retrievedChunks[0].score,
      isGrounded: true,
      provider: 'CampusBrain Grounded AI (Offline Engine)',
      model: 'smart-grounded-rag'
    };
  }

  // Call Google Gemini REST endpoint
  async callGemini(apiKey, systemInstruction, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000
      }
    };

    const res = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    if (res.data && res.data.candidates && res.data.candidates[0]?.content?.parts[0]?.text) {
      return res.data.candidates[0].content.parts[0].text;
    }
    throw new Error('Invalid Gemini API response structure');
  }

  // Call OpenRouter API endpoint
  async callOpenRouter(apiKey, systemInstruction, prompt) {
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const payload = {
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000
    };

    const res = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://campusbrain.edu',
        'X-Title': 'CampusBrain RAG Chatbot'
      },
      timeout: 15000
    });

    if (res.data && res.data.choices && res.data.choices[0]?.message?.content) {
      return res.data.choices[0].message.content;
    }
    throw new Error('Invalid OpenRouter API response structure');
  }

  // Smart grounded local synthesizer when API keys are not provided
  synthesizeLocalAnswer(query, retrievedChunks) {
    const primaryDoc = retrievedChunks[0];
    const bulletPoints = [];
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    retrievedChunks.forEach((chunk, index) => {
      const lines = chunk.text.split('\n').map(l => l.trim()).filter(Boolean);
      lines.forEach(line => {
        const lower = line.toLowerCase();
        const hasMatch = keywords.some(k => lower.includes(k));
        if (hasMatch && !line.startsWith('#') && line.length > 20) {
          if (!bulletPoints.includes(line)) {
            bulletPoints.push(line);
          }
        }
      });
    });

    let markdown = `Based on the official **${primaryDoc.documentTitle}** (${primaryDoc.department}):\n\n`;

    if (bulletPoints.length > 0) {
      markdown += `### Key Details & Guidelines:\n`;
      bulletPoints.slice(0, 6).forEach(pt => {
        // Clean leading dashes or bullets
        const cleanPt = pt.replace(/^[\*\-\•\d\.]+\s*/, '');
        markdown += `- ${cleanPt}\n`;
      });
      markdown += `\n`;
    } else {
      // Return the top relevant excerpt cleanly formatted
      markdown += `> ${primaryDoc.text.trim()}\n\n`;
    }

    markdown += `*Reference: [Source 1 - ${primaryDoc.documentTitle}]* (Relevance Match: ${Math.round(primaryDoc.score * 100)}%)`;

    return markdown;
  }

  // Generate Document Summary
  async summarizeDocument(docText, docTitle) {
    const settings = memoryDb.systemSettings;
    const geminiKey = settings.geminiApiKey || env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const prompt = `Please provide a concise, 3-4 bullet point executive summary and target audience for this college document titled "${docTitle}":\n\n${docText.substring(0, 3000)}`;
        return await this.callGemini(geminiKey, "You are a concise college document summarizer.", prompt);
      } catch (err) {
        console.warn('Gemini summary failed:', err.message);
      }
    }

    // Local summary
    const lines = docText.split('\n').map(l => l.trim()).filter(l => l.length > 30 && !l.startsWith('#')).slice(0, 4);
    return `### Executive Summary of ${docTitle}:\n\n` + lines.map(l => `- ${l}`).join('\n');
  }
}

const aiService = new AIService();

module.exports = aiService;
