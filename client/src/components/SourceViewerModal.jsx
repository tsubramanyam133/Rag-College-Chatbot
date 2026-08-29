import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  X, 
  FileText, 
  Building2, 
  Tag, 
  Check, 
  Copy, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const SourceViewerModal = () => {
  const { selectedSourceForModal, setSelectedSourceForModal } = useStore();
  const [copied, setCopied] = useState(false);

  if (!selectedSourceForModal) return null;

  const source = selectedSourceForModal;
  const matchPercent = Math.round((source.score || 0) * 100);

  const handleCopy = () => {
    navigator.clipboard.writeText(source.fullText || source.textSnippet || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-4 sm:p-6 overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {source.title || 'Document Source'}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                <span className="flex items-center gap-1 text-slate-300 truncate">
                  <Building2 className="w-3 h-3 text-indigo-400 shrink-0" /> {source.department || 'Campus Office'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-indigo-300 shrink-0">
                  <Tag className="w-3 h-3" /> {source.category || 'General'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedSourceForModal(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Confidence Relevance Banner */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300">Semantic Vector Similarity Match</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-xl bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 shrink-0">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{matchPercent}% Confidence</span>
            </div>
          </div>

          {/* Full Text Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-[11px]">Original Document Chunk Excerpt:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 max-h-60 overflow-y-auto font-sans text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-indigo-600">
              {source.fullText || source.textSnippet}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={() => setSelectedSourceForModal(null)}
            className="px-5 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
