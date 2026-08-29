import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  uploadDocumentFile, 
  createDirectDocument, 
  getDocuments, 
  deleteDocument,
  getDocumentDetails,
  getDocumentSummary,
  getDocumentFAQs,
  rebuildVectorIndex
} from '../services/api';
import { 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  Layers, 
  Building2, 
  Tag, 
  RefreshCw,
  Search,
  FileCode,
  Check,
  AlertCircle,
  BookOpen
} from 'lucide-react';

const DEPARTMENTS = [
  'Admissions Office',
  'Accounts & Finance',
  'Academic Office & Exam Cell',
  'Student Affairs & Chief Warden Office',
  'Corporate Relations & Placement Cell',
  'Dean Student Welfare',
  'General Administration'
];

const CATEGORIES = [
  'Admissions',
  'Fees',
  'Academics',
  'Hostel & Campus',
  'Placements',
  'Campus Life',
  'Scholarships',
  'Policy & Discipline'
];

export const AdminKnowledgeHub = () => {
  const { documents, setDocuments, user, setIsAuthOpen } = useStore();

  const isAdmin = user?.role === 'admin';

  const [activeSubTab, setActiveSubTab] = useState('catalog'); // 'catalog' | 'upload' | 'paste'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Upload Form State
  const [file, setFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [pasteContent, setPasteContent] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [selectedDocDetails, setSelectedDocDetails] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [docSummary, setDocSummary] = useState(null);
  const [docFAQs, setDocFAQs] = useState([]);

  // Load documents
  const fetchDocs = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Handle File Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a PDF or Text file.');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', docTitle || file.name.replace(/\.[^/.]+$/, ''));
    formData.append('department', department);
    formData.append('category', category);
    formData.append('description', description);

    try {
      const res = await uploadDocumentFile(formData);
      setUploadSuccess(`Uploaded "${res.data.document.title}" (${res.data.chunkCount} vector chunks created)!`);
      setFile(null);
      setDocTitle('');
      setDescription('');
      fetchDocs();
      setTimeout(() => setActiveSubTab('catalog'), 1200);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Text Paste Direct Create
  const handlePasteCreate = async (e) => {
    e.preventDefault();
    if (!docTitle || !pasteContent) {
      alert('Title and content are required.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await createDirectDocument({
        title: docTitle,
        content: pasteContent,
        department,
        category,
        description
      });
      setUploadSuccess(`Created "${res.data.document.title}" (${res.data.chunkCount} vector chunks created)!`);
      setDocTitle('');
      setPasteContent('');
      setDescription('');
      fetchDocs();
      setTimeout(() => setActiveSubTab('catalog'), 1200);
    } catch (err) {
      alert('Error creating document: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (id, title) => {
    if (confirm(`Delete document "${title}" and all its vector chunks?`)) {
      try {
        await deleteDocument(id);
        fetchDocs();
        if (selectedDocDetails?.document.id === id) {
          setSelectedDocDetails(null);
        }
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  // View Document & Chunks
  const handleViewDoc = async (docId) => {
    try {
      const res = await getDocumentDetails(docId);
      setSelectedDocDetails(res.data);
      setDocSummary(null);
      setDocFAQs([]);
    } catch (err) {
      console.error('Error fetching doc details:', err);
    }
  };

  // Generate Summary
  const handleGenerateSummary = async (docId) => {
    setIsSummarizing(true);
    try {
      const res = await getDocumentSummary(docId);
      setDocSummary(res.data.summary);
    } catch (err) {
      alert('Summary error: ' + err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Generate FAQs
  const handleGenerateFAQs = async (docId) => {
    try {
      const res = await getDocumentFAQs(docId);
      setDocFAQs(res.data.faqs || []);
    } catch (err) {
      alert('FAQ error: ' + err.message);
    }
  };

  // Filtered list
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'All' || doc.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Campus Knowledge Base & Vector Index</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage college manuals, PDFs, guidelines, fee circulars, and inspect chunked vector embeddings.
          </p>
        </div>

        {/* SubTab Toggles - ONLY FOR ADMIN */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveSubTab('catalog')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Catalog ({documents.length})
            </button>
            <button
              onClick={() => setActiveSubTab('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload File
            </button>
            <button
              onClick={() => setActiveSubTab('paste')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'paste'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> Paste Text
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-semibold shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official College Catalog</span>
          </div>
        )}
      </div>

      {/* Upload Notification Success */}
      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* TAB 1: CATALOG VIEW */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents by title or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/60"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-2xl text-xs bg-slate-900 border border-slate-800 text-slate-300 outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="glass-card p-5 rounded-3xl border border-slate-800/90 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all duration-200"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                        {doc.category}
                      </span>
                    </div>

                    {/* Delete Icon - ONLY FOR ADMIN */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.title)}
                        title="Delete Document"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{doc.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.description || 'Verified official campus document for RAG indexing.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-indigo-400" /> {doc.department}
                    </span>
                    <span className="font-mono text-indigo-300 font-semibold">{doc.chunkCount} Chunks</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDoc(doc.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Chunks
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD FILE */}
      {activeSubTab === 'upload' && (
        <div className="max-w-2xl mx-auto glass-panel p-6 rounded-3xl border border-slate-800 animate-fade-in">
          {!isAdmin ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-white">Staff / Admin Permission Required</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Official college policy documents, fee circulars, and exam regulations can only be uploaded and managed by verified College Administrators to maintain academic data integrity.
                </p>
              </div>
              <button
                onClick={() => setIsAuthOpen(true, 'login')}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
              >
                Sign In as Admin
              </button>
            </div>
          ) : (
            <form onSubmit={handleFileUpload} className="space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" /> Upload College PDF / Document
              </h3>

              {/* Drop Zone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 rounded-3xl p-8 text-center bg-slate-900/40 transition-colors">
                <input
                  type="file"
                  id="file-upload-input"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">
                      {file ? file.name : 'Click or Drag & Drop PDF, TXT, or MD file'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size: 15MB'}
                    </div>
                  </div>
                </label>
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Hostel Fee Circular 2026"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Brief summary of the document"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full py-3 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:brightness-110 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isUploading ? 'Chunking & Vector Indexing...' : 'Upload & Build Vector Chunks'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: PASTE TEXT DIRECT */}
      {activeSubTab === 'paste' && (
        <div className="max-w-2xl mx-auto glass-panel p-6 rounded-3xl border border-slate-800 animate-fade-in">
          {!isAdmin ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-white">Staff / Admin Permission Required</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Only authorized college administrators can register and publish official text policies to the knowledge vector store.
                </p>
              </div>
              <button
                onClick={() => setIsAuthOpen(true, 'login')}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
              >
                Sign In as Admin
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasteCreate} className="space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-400" /> Create Document from Text / Markdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Library Rules & Digital Subscriptions"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 outline-none"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Document Content (Markdown supported)</label>
                <textarea
                  rows={8}
                  placeholder="Paste guidelines, FAQs, circular policies, or syllabus details here..."
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  className="w-full p-3.5 rounded-2xl text-xs font-mono bg-slate-900/90 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!docTitle || !pasteContent || isUploading}
                className="w-full py-3 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{isUploading ? 'Chunking & Indexing...' : 'Create & Index in Vector DB'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* INSPECT DOCUMENT CHUNKS & AUTO-FAQS MODAL */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl glass-panel border border-slate-700/80 shadow-2xl p-4 sm:p-6 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
                  {selectedDocDetails.document.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="text-indigo-300">{selectedDocDetails.document.department}</span>
                  <span>•</span>
                  <span>{selectedDocDetails.chunks.length} Vector Chunks</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Auto Summarize */}
                <button
                  onClick={() => handleGenerateSummary(selectedDocDetails.document.id)}
                  disabled={isSummarizing}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isSummarizing ? 'Summarizing...' : 'AI Summary'}</span>
                </button>

                {/* Auto FAQs */}
                <button
                  onClick={() => handleGenerateFAQs(selectedDocDetails.document.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-500/30 hover:bg-purple-900 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Auto FAQs</span>
                </button>

                <button
                  onClick={() => setSelectedDocDetails(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Container for All Content (Summary, FAQs, and Chunks) */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
              {/* AI Summary Banner if generated */}
              {docSummary && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed animate-fade-in shadow-inner">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Executive Summary:</span>
                  </div>
                  <div className="whitespace-pre-wrap">{docSummary}</div>
                </div>
              )}

              {/* Generated FAQs if generated */}
              {docFAQs.length > 0 && (
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 leading-relaxed space-y-2 animate-fade-in shadow-inner">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Suggested Student FAQs (Click to Ask in Chat):</span>
                  </div>
                  <div className="space-y-1.5">
                    {docFAQs.map((faq, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-purple-900/30 border border-purple-500/20 text-slate-200"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-purple-400 font-bold">Q{i + 1}:</span>
                          <span className="truncate">{faq}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chunks List */}
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-400 px-0.5">
                  Segmented Vector Chunks ({selectedDocDetails.chunks.length}):
                </div>

                {selectedDocDetails.chunks.map((chunk, idx) => (
                  <div key={chunk.id || idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-indigo-400 font-semibold">Chunk #{idx + 1}</span>
                      <span className="text-[10px] text-slate-500">{chunk.charCount || chunk.text.length} characters</span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setSelectedDocDetails(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
