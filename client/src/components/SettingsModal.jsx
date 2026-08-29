import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getSystemSettings, updateSystemSettings, rebuildVectorIndex } from '../services/api';
import { 
  X, 
  Settings, 
  Key, 
  Cpu, 
  Sliders, 
  RefreshCw, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';

export const SettingsModal = () => {
  const { isSettingsOpen, setIsSettingsOpen } = useStore();

  const [geminiKey, setGeminiKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);

  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [threshold, setThreshold] = useState(0.20);
  const [topK, setTopK] = useState(4);
  const [strictGrounding, setStrictGrounding] = useState(true);

  const [hasGemini, setHasGemini] = useState(false);
  const [hasOpenRouter, setHasOpenRouter] = useState(false);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isMongo, setIsMongo] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isSettingsOpen) {
      getSystemSettings()
        .then(res => {
          const s = res.data.settings;
          setModelName(s.modelName || 'gemini-1.5-flash');
          setThreshold(s.similarityThreshold || 0.20);
          setTopK(s.topK || 4);
          setStrictGrounding(s.strictRAGGrounding !== false);
          setHasGemini(s.hasGeminiKey);
          setHasOpenRouter(s.hasOpenRouterKey);
          setTotalChunks(s.totalChunksIndexed || 0);
          setIsMongo(s.isMongoConnected);
        })
        .catch(err => console.error('Error fetching settings:', err));
    }
  }, [isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSystemSettings({
        geminiApiKey: geminiKey,
        openrouterApiKey: openrouterKey,
        modelName,
        similarityThreshold: threshold,
        topK,
        strictRAGGrounding: strictGrounding
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsSettingsOpen(false);
      }, 1000);
    } catch (err) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRebuild = async () => {
    try {
      const res = await rebuildVectorIndex();
      alert(`Vector index rebuilt! ${res.data.totalChunks} chunks active.`);
      setTotalChunks(res.data.totalChunks);
    } catch (err) {
      alert('Error rebuilding index: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">System & AI Credentials</h3>
              <p className="text-[11px] text-slate-400">Configure RAG thresholds, Gemini API keys, and models</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* System Status Indicators */}
          <div className="grid grid-cols-2 gap-2.5 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-slate-400">Database Engine</div>
                <div className="font-semibold text-slate-200 truncate">{isMongo ? 'MongoDB Atlas' : 'In-Memory JSON DB'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-slate-400">Active Vector Chunks</div>
                <div className="font-semibold text-indigo-300 truncate">{totalChunks} Indexed Chunks</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            {/* Gemini API Key */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                  <Key className="w-3.5 h-3.5 text-indigo-400" /> Google Gemini API Key
                </label>
                {hasGemini && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle className="w-3 h-3" /> Key Active
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showGemini ? 'text' : 'password'}
                  placeholder="AIzaSy... (Leave blank to use built-in offline engine)"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3.5 py-1.5 pr-10 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showGemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> AI Generation Model
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none"
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Recommended - Ultra Fast)</option>
                <option value="gemini-2.0-flash">Google Gemini 2.0 Flash</option>
                <option value="openai/gpt-4o-mini">OpenRouter / GPT-4o-mini</option>
                <option value="smart-grounded-rag">Built-in Semantic Grounded Engine (Offline / No Key)</option>
              </select>
            </div>

            {/* RAG Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Min Similarity:</span>
                  <span className="font-mono text-indigo-400 font-bold">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Top-K Context Chunks:</span>
                  <span className="font-mono text-purple-400 font-bold">{topK}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleRebuild}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-index Vectors
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                {saveSuccess ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                <span>{saveSuccess ? 'Saved!' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
