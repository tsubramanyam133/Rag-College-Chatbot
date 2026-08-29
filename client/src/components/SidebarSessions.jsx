import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Download, 
  Search,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { updateSessionTitle, deleteChatSession } from '../services/api';

export const SidebarSessions = () => {
  const { 
    sessions, 
    activeSessionId, 
    setActiveSessionId, 
    setMessages, 
    setSessions,
    messages,
    isSidebarOpen,
    setIsSidebarOpen
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    const newId = `ses-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setMessages([]);
  };

  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title || 'Untitled');
  };

  const handleSaveRename = async (sessionId, e) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      await updateSessionTitle(sessionId, { title: editTitle.trim() });
      setSessions(sessions.map(s => s.id === sessionId ? { ...s, title: editTitle.trim() } : s));
      setEditingId(null);
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  const handleDelete = async (sessionId, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteChatSession(sessionId);
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].id);
        } else {
          const newId = `ses-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          setSessions([{
            id: newId,
            title: 'New Conversation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]);
          setActiveSessionId(newId);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
      // Still update UI optimistically
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
    }
  };

  const handleExportChat = (e) => {
    e.stopPropagation();
    if (!messages || messages.length === 0) {
      alert('No messages to export in this conversation.');
      return;
    }

    const currentSession = sessions.find(s => s.id === activeSessionId);
    const content = messages.map(m => `### ${m.role === 'user' ? 'Student' : 'CampusBrain AI'} (${new Date(m.timestamp).toLocaleTimeString()})\n${m.content}\n\n`).join('---\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentSession?.title || 'conversation').replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-14 lg:top-0 bottom-0 left-0 z-40 w-72 md:w-80 h-[calc(100dvh-3.5rem)] lg:h-full border-r border-slate-800/80 bg-slate-950/95 lg:bg-slate-950/60 backdrop-blur-2xl flex flex-col shrink-0 select-none transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-800/70 flex items-center gap-2 shrink-0">
          <button
            id="new-chat-btn"
            onClick={handleNewChat}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:brightness-110 shadow-md shadow-indigo-600/25 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </button>

          <button
            onClick={handleExportChat}
            title="Export Conversation (Markdown)"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 lg:hidden"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 py-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Session History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Recent Consultations</span>
            <span className="text-[10px] text-slate-600 font-mono">{filteredSessions.length}</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-6 px-4 text-slate-500 text-xs">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30 text-indigo-400" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    if (!isEditing) {
                      setActiveSessionId(session.id);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }
                  }}
                  className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/40 text-indigo-200 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`} />

                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(session.id, e);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 px-1.5 py-0.5 text-xs bg-slate-950 border border-indigo-500 rounded text-white outline-none"
                      />
                      <button
                        onClick={(e) => handleSaveRename(session.id, e)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-left">{session.title || 'Untitled Conversation'}</span>

                      <div className="flex sm:opacity-0 sm:group-hover:opacity-100 items-center gap-1 shrink-0 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(session, e)}
                          title="Rename Conversation"
                          className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(session.id, e)}
                          title="Delete Conversation"
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* College Info Footer Badge */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/90 text-xs shrink-0">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
            <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="truncate">
              <div className="font-medium text-slate-300 text-[10px] truncate">Academic Knowledge Engine</div>
              <div className="text-[9px] text-indigo-400/90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Vector Index Ready
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
