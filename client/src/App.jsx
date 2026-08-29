import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { 
  getChatSessions, 
  getSessionMessages, 
  sendChatMessage, 
  getDocuments, 
  getSuggestedPrompts 
} from './services/api';
import { Navbar } from './components/Navbar';
import { SidebarSessions } from './components/SidebarSessions';
import { ChatInterface } from './components/ChatInterface';
import { ChatInput } from './components/ChatInput';
import { SourceViewerModal } from './components/SourceViewerModal';
import { AdminKnowledgeHub } from './components/AdminKnowledgeHub';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';

export function App() {
  const { 
    activeTab, 
    sessions, 
    setSessions, 
    activeSessionId, 
    setActiveSessionId, 
    messages, 
    setMessages, 
    addMessage, 
    isGenerating, 
    setIsGenerating,
    setDocuments,
    setSuggestedPrompts,
    selectedDepartment
  } = useStore();

  const [inputQuery, setInputQuery] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    // 1. Fetch Chat Sessions
    getChatSessions()
      .then(res => {
        const list = res.data.sessions || [];
        setSessions(list);
        if (list.length > 0 && !activeSessionId) {
          setActiveSessionId(list[0].id);
        }
      })
      .catch(err => console.error('Error loading sessions:', err));

    // 2. Fetch Knowledge Base Documents
    getDocuments()
      .then(res => setDocuments(res.data.documents || []))
      .catch(err => console.error('Error loading documents:', err));

    // 3. Fetch Suggested Prompts
    getSuggestedPrompts()
      .then(res => setSuggestedPrompts(res.data.prompts || []))
      .catch(err => console.error('Error loading prompts:', err));
  }, []);

  // Fetch messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      getSessionMessages(activeSessionId)
        .then(res => setMessages(res.data.messages || []))
        .catch(err => console.error('Error loading messages:', err));
    }
  }, [activeSessionId]);

  // Send Message Handler
  const handleSendMessage = async (queryText) => {
    if (!queryText || !queryText.trim() || isGenerating) return;

    const userQuery = queryText.trim();
    const tempUserMsgId = `msg-${Date.now()}-u`;

    // Optimistically append user message
    const userMsg = {
      id: tempUserMsgId,
      sessionId: activeSessionId,
      role: 'user',
      content: userQuery,
      timestamp: new Date().toISOString()
    };
    addMessage(userMsg);
    setIsGenerating(true);

    try {
      const res = await sendChatMessage({
        query: userQuery,
        sessionId: activeSessionId,
        departmentFilter: selectedDepartment
      });

      // Update active session ID if a new session was created
      if (res.data.sessionId && res.data.sessionId !== activeSessionId) {
        setActiveSessionId(res.data.sessionId);
        // Refresh session list
        getChatSessions().then(r => setSessions(r.data.sessions || []));
      }

      // Append bot response
      const botMsg = {
        id: res.data.messageId || `msg-${Date.now()}-ai`,
        sessionId: res.data.sessionId,
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources || [],
        confidenceScore: res.data.confidenceScore || 0,
        isGrounded: res.data.isGrounded !== false,
        provider: res.data.provider,
        model: res.data.model,
        responseTimeMs: res.data.responseTimeMs,
        analyticsEventId: res.data.analyticsEventId,
        timestamp: new Date().toISOString()
      };
      addMessage(botMsg);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: `msg-${Date.now()}-err`,
        sessionId: activeSessionId,
        role: 'assistant',
        content: '⚠️ An error occurred while communicating with the RAG engine: ' + (err.response?.data?.error || err.message),
        sources: [],
        confidenceScore: 0,
        isGrounded: false,
        timestamp: new Date().toISOString()
      };
      addMessage(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPrompt = (promptText) => {
    setInputQuery(promptText);
    handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: CHAT VIEW */}
        {activeTab === 'chat' && (
          <>
            {/* Sidebar Chat Sessions */}
            <SidebarSessions />

            {/* Chat Canvas & Input */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950 relative">
              {/* Subtle background ambient glow */}
              <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Messages Flow Area */}
              <ChatInterface onSelectPrompt={handleSelectPrompt} />

              {/* Chat Input Bar */}
              <ChatInput 
                onSendMessage={handleSendMessage} 
                inputQuery={inputQuery} 
                setInputQuery={setInputQuery} 
              />
            </main>
          </>
        )}

        {/* VIEW 2: KNOWLEDGE BASE HUB */}
        {activeTab === 'knowledge' && (
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
            <AdminKnowledgeHub />
          </main>
        )}

        {/* VIEW 3: TELEMETRY & ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
            <AnalyticsDashboard />
          </main>
        )}
      </div>

      {/* Global Modals */}
      <SourceViewerModal />
      <SettingsModal />
      <AuthModal />
    </div>
  );
}

export default App;
