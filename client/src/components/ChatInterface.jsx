import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../store/useStore';
import { 
  Bot, 
  User, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink, 
  FileText, 
  Clock, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  Zap,
  GraduationCap
} from 'lucide-react';
import { submitAnswerFeedback } from '../services/api';

const QUICK_PROMPTS = [
  { label: '🏛️ Admissions & Cutoffs', prompt: 'What are the eligibility criteria and entrance exam cutoff ranks for B.Tech CSE?' },
  { label: '💰 Fee Structure & Scholarships', prompt: 'What is the annual tuition fee for B.Tech and what scholarship schemes are available?' },
  { label: '📚 Attendance 75% Rule', prompt: 'What is the mandatory attendance requirement policy for semester exams?' },
  { label: '🏢 Hostel Curfew & Rooms', prompt: 'What are the hostel room types, fees, and gate entry curfew timings?' },
  { label: '🚀 Placement Stats & Top Packages', prompt: 'What was the highest package, average package, and top recruiters in campus placements?' },
  { label: '📖 Library & Student Clubs', prompt: 'What are the central library working hours and student technical clubs on campus?' }
];

export const ChatInterface = ({ onSelectPrompt }) => {
  const { 
    messages, 
    isGenerating, 
    setSelectedSourceForModal,
    user
  } = useStore();

  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({}); // msgId -> 'up' | 'down'

  useEffect(() => {
    // Smooth scroll to keep the newest Q&A turn visible
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, isGenerating]);

  // Copy text to clipboard
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text to Speech
  const handleSpeak = (id, text) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const cleanText = text.replace(/[#\*\-\_\[\]\(\)]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Submit Feedback
  const handleFeedback = async (message, feedbackType) => {
    if (feedbackGiven[message.id]) return;

    try {
      if (message.analyticsEventId) {
        await submitAnswerFeedback({
          eventId: message.analyticsEventId,
          feedback: feedbackType,
          feedbackNote: feedbackType === 'up' ? 'Helpful answer' : 'Could be improved'
        });
      }
      setFeedbackGiven(prev => ({ ...prev, [message.id]: feedbackType }));
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 pt-4 pb-2 sm:pb-3 space-y-3.5">
      {/* Empty State / Welcome Hero */}
      {messages.length === 0 && (
        <div className="max-w-3xl mx-auto py-6 text-center space-y-6 animate-fade-in">
          {/* Glowing Avatar Hero */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-40 animate-pulse-glow"></div>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              How can I help you with <span className="text-gradient">Campus Life</span> today?
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Ask anything about admissions, course syllabus, exam schedules, hostel rules, tuition fees, and placements. Grounded on official verified college documents.
            </p>
          </div>

          {/* Quick Prompt Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 text-left">
            {QUICK_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(item.prompt)}
                className="glass-card p-3 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-200 group text-left flex flex-col justify-between space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-300 group-hover:text-indigo-200">{item.label}</span>
                  <Zap className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </button>
            ))}
          </div>

          {/* Trust & Guarantee Banner */}
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/60 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Document Grounded
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-indigo-400">
              <FileText className="w-3 h-3" /> Exact Citations
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3 h-3" /> Semantic RAG
            </span>
          </div>
        </div>
      )}

      {/* Message History */}
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';

        return (
          <div
            key={msg.id || index}
            className={`flex gap-2.5 max-w-4xl mx-auto animate-fade-in ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Bot Avatar */}
            {!isUser && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-indigo-600/20">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}

            {/* Message Body */}
            <div className={`space-y-1.5 max-w-[90%] sm:max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
              {/* Message Header */}
              {isUser ? (
                <div className="text-[10px] text-indigo-300 font-semibold text-right pr-1">
                  You asked:
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                  <span className="font-semibold text-indigo-300">CampusBrain Assistant</span>
                  {msg.provider && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800/80 text-slate-300 border border-slate-700">
                      {msg.provider}
                    </span>
                  )}
                  {msg.responseTimeMs && (
                    <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {msg.responseTimeMs}ms
                    </span>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/20'
                    : 'glass-panel rounded-tl-sm border border-slate-800/90 text-slate-200 shadow-md'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose-custom">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* RAG Source Cards (For Bot Messages) */}
              {!isUser && msg.sources && msg.sources.length > 0 && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 px-1">
                    <FileText className="w-2.5 h-2.5 text-indigo-400" />
                    <span>Retrieved Knowledge Sources ({msg.sources.length}):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {msg.sources.map((source, srcIdx) => (
                      <button
                        key={source.id || srcIdx}
                        onClick={() => setSelectedSourceForModal(source)}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
                      >
                        <div className="truncate flex-1">
                          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                            [{srcIdx + 1}] {source.title}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">
                            {source.department} • {source.category}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/20 shrink-0">
                          <span>{Math.round((source.score || 0) * 100)}%</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bot Message Action Buttons */}
              {!isUser && (
                <div className="flex items-center gap-1.5 pt-0.5 px-1 text-slate-400">
                  {/* Read Aloud Button */}
                  <button
                    onClick={() => handleSpeak(msg.id, msg.content)}
                    title={speakingId === msg.id ? "Stop voice" : "Read aloud"}
                    className={`p-1 rounded-lg hover:bg-slate-800 transition-colors ${
                      speakingId === msg.id ? 'text-indigo-400 bg-indigo-950/40' : 'hover:text-slate-200'
                    }`}
                  >
                    {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    title="Copy Answer"
                    className="p-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Feedback Buttons */}
                  <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                    <button
                      onClick={() => handleFeedback(msg, 'up')}
                      title="Helpful"
                      className={`p-1 rounded-lg transition-colors ${
                        feedbackGiven[msg.id] === 'up'
                          ? 'text-emerald-400 bg-emerald-950/30'
                          : 'hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg, 'down')}
                      title="Not helpful"
                      className={`p-1 rounded-lg transition-colors ${
                        feedbackGiven[msg.id] === 'down'
                          ? 'text-rose-400 bg-rose-950/30'
                          : 'hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {/* Suggested Follow-up Questions from Image 2 (Shown on the latest Bot Response) */}
              {!isUser && index === messages.length - 1 && (
                <div className="space-y-1.5 pt-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 px-0.5">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Suggested Next Questions:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {QUICK_PROMPTS.map((item, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => onSelectPrompt(item.prompt)}
                        className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all text-left group shadow-sm flex flex-col justify-between space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300 group-hover:text-indigo-200">
                          <span>{item.label}</span>
                          <Zap className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <p className="text-[10px] text-slate-400 group-hover:text-slate-300 line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {isUser && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-purple-600/20 font-bold text-xs">
                {user ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>
            )}
          </div>
        );
      })}

      {/* Generating Typing Indicator */}
      {isGenerating && (
        <div className="flex gap-3.5 max-w-4xl mx-auto items-start animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-indigo-600/20">
            <Bot className="w-4 h-4" />
          </div>
          <div className="p-4 rounded-2xl rounded-tl-sm glass-panel border border-slate-800/90 text-slate-300 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-xs text-slate-400">Searching vector index and grounding answer...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
