import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { loginUser, registerUser } from '../services/api';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Building2, 
  Sparkles, 
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export const AuthModal = () => {
  const { isAuthOpen, setIsAuthOpen, authMode, setAuth } = useStore();

  const [mode, setMode] = useState(authMode || 'login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [role, setRole] = useState('student');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isAuthOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const res = await loginUser({ email, password });
        setAuth(res.data.user, res.data.token);
        setIsAuthOpen(false);
      } else {
        const res = await registerUser({ name, email, password, role, department });
        setAuth(res.data.user, res.data.token);
        setIsAuthOpen(false);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@campus.edu');
      setPassword('Admin@1234');
      setMode('login');
    } else {
      setEmail('student@campus.edu');
      setPassword('Student@1234');
      setMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {mode === 'login' ? 'Sign In to CampusBrain' : 'Student & Staff Portal'}
              </h3>
              <p className="text-[11px] text-slate-400">Access personalized college assistance</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {/* Demo Fast Login Buttons */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className="py-1.5 px-2 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 transition-all flex items-center justify-center gap-1"
            >
              <span>👨‍🎓 Fill Demo Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-1.5 px-2 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-purple-600/30 border border-slate-700/60 transition-all flex items-center justify-center gap-1"
            >
              <span>🛡️ Fill Demo Admin</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-1 rounded-xl text-xs font-semibold transition-all ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-1 rounded-xl text-xs font-semibold transition-all ${
                mode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="admin">College Staff / Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE / ECE"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:brightness-110 shadow-lg shadow-indigo-600/30 transition-all mt-2"
            >
              {isLoading ? 'Authenticating...' : mode === 'login' ? 'Sign In to CampusBrain' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
