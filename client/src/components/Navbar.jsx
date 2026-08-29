import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Bot, 
  Database, 
  BarChart3, 
  Settings, 
  User, 
  LogOut, 
  Sparkles,
  BookOpen,
  Filter,
  PanelLeft,
  Menu
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Admissions Office',
  'Accounts & Finance',
  'Academic Office & Exam Cell',
  'Student Affairs & Chief Warden Office',
  'Corporate Relations & Placement Cell',
  'Dean Student Welfare'
];

export const Navbar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    isAuthenticated, 
    logout, 
    setIsAuthOpen, 
    setIsSettingsOpen,
    selectedDepartment,
    setSelectedDepartment,
    documents,
    toggleSidebar,
    isSidebarOpen
  } = useStore();

  return (
    <header className="h-14 lg:h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-3 lg:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Toggle Sidebar Button */}
        {activeTab === 'chat' && (
          <button
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Hide Chat History" : "Show Chat History"}
            className="p-1.5 lg:p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="relative flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
          <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm lg:text-base tracking-tight text-white flex items-center gap-1">
              CampusBrain <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 font-extrabold">AI</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-2.5 h-2.5" /> RAG
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80">
        <button
          id="nav-chat-tab"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Chat Assistant</span>
        </button>

        <button
          id="nav-knowledge-tab"
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'knowledge'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Knowledge Hub</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800/80 text-slate-300 border border-slate-700">
            {documents.length || 6}
          </span>
        </button>

        <button
          id="nav-analytics-tab"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Department Filter (Only on Chat) */}
        {activeTab === 'chat' && (
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300">
            <Filter className="w-3 h-3 text-indigo-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900 text-slate-200">
                  {dept === 'All' ? '🏛️ All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Settings Button - ONLY FOR ADMIN */}
        {user?.role === 'admin' && (
          <button
            id="open-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="System Settings & API Keys"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* User Profile / Auth Button */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">{user.name}</div>
                <div className="text-[10px] text-indigo-400 capitalize">{user.role}</div>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            id="open-auth-btn"
            onClick={() => setIsAuthOpen(true, 'login')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:brightness-110 shadow-md shadow-indigo-500/20 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
