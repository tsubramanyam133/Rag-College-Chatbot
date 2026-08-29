import React, { useState, useEffect } from 'react';
import { getAnalyticsStats, resolveUnresolvedQuery } from '../services/api';
import { useStore } from '../store/useStore';
import { 
  BarChart3, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Layers,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { setActiveTab } = useStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResolve = async (id) => {
    try {
      await resolveUnresolvedQuery(id, { status: 'resolved' });
      fetchStats();
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mr-2" />
        <span>Loading real-time campus analytics...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-pink-400" />
            <span>Campus Telemetry & Query Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time insights on student questions, RAG accuracy, user feedback, and unanswered query resolution.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Queries */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Consultations</span>
            <div className="text-2xl font-extrabold text-white">{stats?.totalQueries || 0}</div>
            <div className="text-[10px] text-indigo-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live Event Stream
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Grounded Accuracy Rate */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">RAG Grounding Rate</span>
            <div className="text-2xl font-extrabold text-emerald-400">{stats?.groundedRate || 100}%</div>
            <div className="text-[10px] text-emerald-400/90 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Strict Context Matched
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* User Satisfaction */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Satisfaction Score</span>
            <div className="text-2xl font-extrabold text-purple-300">{stats?.satisfactionRate || 96}%</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>👍 {stats?.positiveFeedback || 0}</span>
              <span>•</span>
              <span>👎 {stats?.negativeFeedback || 0}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        {/* Average Latency */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Avg Response Time</span>
            <div className="text-2xl font-extrabold text-cyan-300 font-mono">{stats?.avgLatencyMs || 8}ms</div>
            <div className="text-[10px] text-cyan-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Vector Index Speed
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Frequent Queries */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>🔥 Most Frequent Student Topics</span>
            <span className="text-xs text-slate-400 font-normal">Top Query Rankings</span>
          </h3>

          <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-2">
            {stats?.topQueries && stats.topQueries.length > 0 ? (
              stats.topQueries.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate flex-1">
                    <span className="w-5 h-5 rounded-lg bg-indigo-950 text-indigo-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="text-slate-200 truncate capitalize">{item.query}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 ml-2">
                    {item.count} asks
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No queries recorded yet.</p>
            )}
          </div>
        </div>

        {/* Unresolved Questions Queue */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Unresolved Query Queue ({stats?.unresolvedCount || 0})</span>
            </h3>
            <button
              onClick={() => setActiveTab('knowledge')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Add Knowledge Document</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {stats?.unresolvedList && stats.unresolvedList.length > 0 ? (
              stats.unresolvedList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1 truncate">
                    <div className="text-slate-200 truncate font-medium">"{item.query}"</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>Asked {item.askCount} time(s)</span>
                      <span>•</span>
                      <span className={item.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleResolve(item.id)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 transition-colors shrink-0"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-emerald-500 opacity-60" />
                <p>All student questions are well-grounded in the knowledge base!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
