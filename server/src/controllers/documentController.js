const ragService = require('../services/ragService');
const aiService = require('../services/aiService');
const { memoryDb } = require('../config/db');

exports.getDocuments = async (req, res) => {
  try {
    const docs = memoryDb.documents.map(doc => {
      const docChunks = memoryDb.chunks.filter(c => c.documentId === doc.id);
      return {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        department: doc.department,
        description: doc.description || '',
        chunkCount: docChunks.length,
        totalChars: doc.content ? doc.content.length : 0,
        uploadedBy: doc.uploadedBy || 'Admin',
        createdAt: doc.createdAt
      };
    });

    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching documents: ' + err.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = memoryDb.documents.find(d => d.id === id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const chunks = memoryDb.chunks.filter(c => c.documentId === id);
    res.json({
      document: doc,
      chunks
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching document details: ' + err.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF, TXT, or MD file.' });
    }

    const { title, category = 'General', department = 'General', description = '' } = req.body;
    const originalName = req.file.originalname;
    const docTitle = title && title.trim() !== '' ? title.trim() : originalName.replace(/\.[^/.]+$/, '');

    // Parse file content
    const parsed = await ragService.parseDocument(req.file.buffer, originalName, req.file.mimetype);
    const content = parsed.text;

    if (!content || content.trim().length < 20) {
      return res.status(400).json({ error: 'The uploaded file appears to be empty or unreadable.' });
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Chunk text
    const chunks = ragService.chunkText(content, 420, 80, {
      documentId: docId,
      documentTitle: docTitle,
      category,
      department
    });

    const newDoc = {
      id: docId,
      title: docTitle,
      category,
      department,
      description: description || `Uploaded file ${originalName} (${chunks.length} chunks generated)`,
      content,
      fileName: originalName,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user ? req.user.name : 'Admin',
      createdAt: new Date().toISOString()
    };

    memoryDb.documents.unshift(newDoc);
    memoryDb.chunks.push(...chunks);

    // Rebuild vector index
    ragService.buildVectorIndex();
    memoryDb.saveSnapshot();

    // Auto-generate FAQs
    const autoFaqs = ragService.generateAutoFAQs(content, docTitle);

    res.status(201).json({
      message: 'Document uploaded, chunked, and indexed successfully in vector database!',
      document: newDoc,
      chunkCount: chunks.length,
      autoFaqs
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process document: ' + err.message });
  }
};

exports.createDocumentDirect = async (req, res) => {
  try {
    const { title, content, category = 'General', department = 'General', description = '' } = req.body;

    if (!title || !content || content.trim().length < 20) {
      return res.status(400).json({ error: 'Title and sufficient content (at least 20 characters) are required.' });
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const chunks = ragService.chunkText(content, 420, 80, {
      documentId: docId,
      documentTitle: title.trim(),
      category,
      department
    });

    const newDoc = {
      id: docId,
      title: title.trim(),
      category,
      department,
      description: description || `Manual document entry with ${chunks.length} chunks`,
      content,
      uploadedBy: req.user ? req.user.name : 'Admin',
      createdAt: new Date().toISOString()
    };

    memoryDb.documents.unshift(newDoc);
    memoryDb.chunks.push(...chunks);

    ragService.buildVectorIndex();
    memoryDb.saveSnapshot();

    const autoFaqs = ragService.generateAutoFAQs(content, title.trim());

    res.status(201).json({
      message: 'Document created and indexed successfully!',
      document: newDoc,
      chunkCount: chunks.length,
      autoFaqs
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creating document: ' + err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const initialDocCount = memoryDb.documents.length;

    memoryDb.documents = memoryDb.documents.filter(d => d.id !== id);
    memoryDb.chunks = memoryDb.chunks.filter(c => c.documentId !== id);

    if (memoryDb.documents.length === initialDocCount) {
      return res.status(404).json({ error: 'Document not found' });
    }

    ragService.buildVectorIndex();
    memoryDb.saveSnapshot();

    res.json({ message: 'Document and its vector chunks deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting document: ' + err.message });
  }
};

exports.generateDocSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = memoryDb.documents.find(d => d.id === id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const summary = await aiService.summarizeDocument(doc.content, doc.title);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Error generating summary: ' + err.message });
  }
};

exports.generateDocFAQs = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = memoryDb.documents.find(d => d.id === id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const faqs = ragService.generateAutoFAQs(doc.content, doc.title);
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ error: 'Error generating FAQs: ' + err.message });
  }
};
