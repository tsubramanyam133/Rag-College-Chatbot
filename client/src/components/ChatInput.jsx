import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  CornerDownLeft,
  X,
  Layers
} from 'lucide-react';

export const ChatInput = ({ onSendMessage, inputQuery, setInputQuery }) => {
  const { isGenerating, selectedDepartment, setActiveTab } = useStore();
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API for Voice Input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setInputQuery]);

  // Handle Voice Toggle
  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic error:', err);
      }
    }
  };

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputQuery]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;

    onSendMessage(inputQuery);
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-3 py-2 sm:py-2.5 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl z-20 shrink-0">
      <div className="max-w-4xl mx-auto space-y-1">
        {/* Selected Department / Category Filter Pill */}
        {selectedDepartment !== 'All' && (
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>Filtering: <strong className="text-white">{selectedDepartment}</strong></span>
          </div>
        )}

        {/* Input Bar Form */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center rounded-2xl glass-panel border border-slate-700/80 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all px-2.5 py-1 shadow-md"
        >
          {/* Multiline Input Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening 
                ? "🎙️ Listening... Speak now..." 
                : "Ask about admissions, fees, hostel, exams, placement packages..."
            }
            className="flex-1 max-h-28 py-1.5 px-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none resize-none overflow-y-auto"
          />

          {/* Voice Microphone Input Button */}
          <button
            type="button"
            onClick={toggleVoice}
            title={isListening ? "Stop listening" : "Voice Input (Speech-to-Text)"}
            className={`p-1.5 sm:p-2 rounded-xl transition-all duration-200 shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Query Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            id="send-message-btn"
            className={`p-1.5 sm:p-2 rounded-xl transition-all duration-200 shrink-0 flex items-center justify-center ml-1 ${
              inputQuery.trim() && !isGenerating
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-indigo-500/30 hover:brightness-110'
                : 'text-slate-600 bg-slate-800/50 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
