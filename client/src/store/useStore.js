import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Auth State
  user: JSON.parse(localStorage.getItem('campusbrain_user') || 'null'),
  token: localStorage.getItem('campusbrain_token') || null,
  isAuthenticated: Boolean(localStorage.getItem('campusbrain_token')),
  setAuth: (user, token) => {
    if (user && token) {
      localStorage.setItem('campusbrain_user', JSON.stringify(user));
      localStorage.setItem('campusbrain_token', token);
      set({ user, token, isAuthenticated: true });
    } else {
      localStorage.removeItem('campusbrain_user');
      localStorage.removeItem('campusbrain_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
  logout: () => {
    localStorage.removeItem('campusbrain_user');
    localStorage.removeItem('campusbrain_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // View Navigation
  activeTab: 'chat', // 'chat' | 'knowledge' | 'analytics'
  setActiveTab: (tab) => set({ activeTab: tab }),

  // System / RAG Settings
  threshold: 0.20,
  setThreshold: (val) => set({ threshold: val }),
  topK: 4,

  // Chat State
  sessions: [],
  activeSessionId: null,
  messages: [],
  isGenerating: false,
  selectedDepartment: 'All',
  selectedCategory: 'All',
  suggestedPrompts: [],
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  setSessions: (sessions) => set({ sessions }),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSuggestedPrompts: (prompts) => set({ suggestedPrompts: prompts }),

  // Documents & Knowledge Base State
  documents: [],
  selectedDocForView: null,
  setDocuments: (docs) => set({ documents: docs }),
  setSelectedDocForView: (doc) => set({ selectedDocForView: doc }),

  // Modal Controls
  selectedSourceForModal: null,
  setSelectedSourceForModal: (source) => set({ selectedSourceForModal: source }),

  isSettingsOpen: false,
  setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

  isAuthOpen: false,
  authMode: 'login', // 'login' | 'register'
  setIsAuthOpen: (isOpen, mode = 'login') => set({ isAuthOpen: isOpen, authMode: mode }),

  // Visual Theme
  theme: localStorage.getItem('campusbrain_theme') || 'dark',
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('campusbrain_theme', next);
    set({ theme: next });
  }
}));
