import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const cleanApiBase = rawApiUrl 
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`) 
  : '/api';

const API = axios.create({
  baseURL: cleanApiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusbrain_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth Endpoints
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMyProfile = () => API.get('/auth/me');

// Chat & RAG Endpoints
export const sendChatMessage = (data) => API.post('/chat/query', data);
export const getChatSessions = () => API.get('/chat/sessions');
export const createChatSession = (data) => API.post('/chat/sessions', data);
export const getSessionMessages = (sessionId) => API.get(`/chat/sessions/${sessionId}/messages`);
export const updateSessionTitle = (sessionId, data) => API.put(`/chat/sessions/${sessionId}`, data);
export const deleteChatSession = (sessionId) => API.delete(`/chat/sessions/${sessionId}`);
export const submitAnswerFeedback = (data) => API.post('/chat/feedback', data);
export const getSuggestedPrompts = () => API.get('/chat/suggested-prompts');

// Document Knowledge Base Endpoints
export const getDocuments = () => API.get('/documents');
export const getDocumentDetails = (id) => API.get(`/documents/${id}`);
export const uploadDocumentFile = (formData) => API.post('/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const createDirectDocument = (data) => API.post('/documents/create-direct', data);
export const deleteDocument = (id) => API.delete(`/documents/${id}`);
export const getDocumentSummary = (id) => API.get(`/documents/${id}/summary`);
export const getDocumentFAQs = (id) => API.get(`/documents/${id}/faqs`);

// Analytics Endpoints
export const getAnalyticsStats = () => API.get('/analytics/stats');
export const resolveUnresolvedQuery = (id, data) => API.post(`/analytics/unresolved/${id}/resolve`, data);

// Settings Endpoints
export const getSystemSettings = () => API.get('/settings');
export const updateSystemSettings = (data) => API.post('/settings/update', data);
export const rebuildVectorIndex = () => API.post('/settings/rebuild-index');

export default API;
