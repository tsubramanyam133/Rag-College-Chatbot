const pdfParse = require('pdf-parse');
const { memoryDb } = require('../config/db');
const { initialCollegeDocuments } = require('../data/seedData');
const env = require('../config/env');
const axios = require('axios');

// Stopwords list for text cleaning
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'please', 'tell', 'give', 'know', 'want'
]);

class RAGService {
  constructor() {
    this.vocabulary = new Map(); // token -> index
    this.inverseVocabulary = []; // index -> token
    this.idfWeights = new Map(); // token -> idf
    this.isInitialized = false;
  }

  // Tokenize and clean text
  tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s\.\,\-\%\$]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim().replace(/^[\.,\-]+|[\.,\-]+$/g, ''))
      .filter(w => w.length > 1 && !STOPWORDS.has(w));
  }

  // Extract N-grams (1-grams and 2-grams) for richer semantic coverage
  extractFeatures(text) {
    const tokens = this.tokenize(text);
    const features = [...tokens];
    for (let i = 0; i < tokens.length - 1; i++) {
      features.push(`${tokens[i]}_${tokens[i + 1]}`);
    }
    return features;
  }

  // Semantic recursive chunker with overlap
  chunkText(text, chunkSize = 420, chunkOverlap = 80, metadata = {}) {
    if (!text) return [];

    // Split text by markdown headings or double newlines first
    const sections = text.split(/(?=\n#{1,4}\s)/g);
    const chunks = [];
    let chunkIndex = 0;

    for (const section of sections) {
      const cleanSection = section.trim();
      if (!cleanSection) continue;

      // If section is small enough, keep as a single cohesive chunk
      if (cleanSection.length <= chunkSize + 50) {
        chunks.push({
          id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}-${chunkIndex++}`,
          documentId: metadata.documentId || 'doc-custom',
          documentTitle: metadata.documentTitle || 'Document',
          category: metadata.category || 'General',
          department: metadata.department || 'Campus',
          text: cleanSection,
          chunkIndex,
          charCount: cleanSection.length,
          createdAt: new Date().toISOString()
        });
        continue;
      }

      // Otherwise, split on paragraphs and sentences with overlap
      const sentences = cleanSection.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [cleanSection];
      let currentChunk = '';

      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (!sentence) continue;

        if ((currentChunk + ' ' + sentence).length > chunkSize && currentChunk.length > 50) {
          chunks.push({
            id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}-${chunkIndex++}`,
            documentId: metadata.documentId || 'doc-custom',
            documentTitle: metadata.documentTitle || 'Document',
            category: metadata.category || 'General',
            department: metadata.department || 'Campus',
            text: currentChunk.trim(),
            chunkIndex,
            charCount: currentChunk.length,
            createdAt: new Date().toISOString()
          });

          // Calculate overlap context from previous sentence
          const overlapSentence = sentence.length < chunkOverlap ? sentence : sentence.slice(-chunkOverlap);
          currentChunk = overlapSentence + ' ';
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }

      if (currentChunk.trim().length > 30) {
        chunks.push({
          id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}-${chunkIndex++}`,
          documentId: metadata.documentId || 'doc-custom',
          documentTitle: metadata.documentTitle || 'Document',
          category: metadata.category || 'General',
          department: metadata.department || 'Campus',
          text: currentChunk.trim(),
          chunkIndex,
          charCount: currentChunk.length,
          createdAt: new Date().toISOString()
        });
      }
    }

    return chunks;
  }

  // Parse uploaded file buffer (PDF or text/markdown)
  async parseDocument(fileBuffer, originalName, mimeType) {
    if (mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfData = await pdfParse(fileBuffer);
        return {
          text: pdfData.text || '',
          pageCount: pdfData.numpages || 1,
          info: pdfData.info || {}
        };
      } catch (err) {
        console.error('PDF Parse Error:', err);
        throw new Error('Failed to parse PDF file content: ' + err.message);
      }
    } else {
      // Plain text, Markdown, CSV, JSON
      const text = fileBuffer.toString('utf8');
      return {
        text,
        pageCount: 1,
        info: {}
      };
    }
  }

  // Build TF-IDF Vocabulary and Index all chunks in memory
  buildVectorIndex() {
    const allChunks = memoryDb.chunks;
    if (!allChunks || allChunks.length === 0) return;

    this.vocabulary.clear();
    this.inverseVocabulary = [];
    this.idfWeights.clear();

    const docFreq = new Map(); // token -> count of chunks containing token
    const N = allChunks.length;

    // Pass 1: Build term frequencies & document frequencies
    allChunks.forEach(chunk => {
      const features = this.extractFeatures(chunk.text);
      const uniqueFeatures = new Set(features);

      uniqueFeatures.forEach(feature => {
        if (!this.vocabulary.has(feature)) {
          this.vocabulary.set(feature, this.vocabulary.size);
          this.inverseVocabulary.push(feature);
        }
        docFreq.set(feature, (docFreq.get(feature) || 0) + 1);
      });
    });

    // Pass 2: Calculate IDF weights: log(1 + (N - df + 0.5) / (df + 0.5))
    docFreq.forEach((df, feature) => {
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5)) + 1.0;
      this.idfWeights.set(feature, idf);
    });

    // Pass 3: Compute and cache unit-normalized TF-IDF vector for each chunk
    allChunks.forEach(chunk => {
      const features = this.extractFeatures(chunk.text);
      const tfMap = new Map();
      features.forEach(f => tfMap.set(f, (tfMap.get(f) || 0) + 1));

      const vector = {};
      let sumSquares = 0;

      tfMap.forEach((count, feature) => {
        const idx = this.vocabulary.get(feature);
        if (idx !== undefined) {
          const idf = this.idfWeights.get(feature) || 1.0;
          // BM25-style term weight: (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgDocLen)))
          const weight = (count / (count + 1.2)) * idf;
          vector[idx] = weight;
          sumSquares += weight * weight;
        }
      });

      const norm = Math.sqrt(sumSquares) || 1;
      // Unit normalize vector
      const normalizedVector = {};
      for (const [idx, weight] of Object.entries(vector)) {
        normalizedVector[idx] = weight / norm;
      }

      chunk.vector = normalizedVector;
    });

    this.isInitialized = true;
    console.log(`🧠 Vector Index built successfully: ${allChunks.length} chunks, ${this.vocabulary.size} vocabulary features.`);
  }

  // Generate vector representation for a query
  vectorizeQuery(query) {
    const features = this.extractFeatures(query);
    const tfMap = new Map();
    features.forEach(f => tfMap.set(f, (tfMap.get(f) || 0) + 1));

    const vector = {};
    let sumSquares = 0;

    tfMap.forEach((count, feature) => {
      const idx = this.vocabulary.get(feature);
      if (idx !== undefined) {
        const idf = this.idfWeights.get(feature) || 1.0;
        const weight = (count / (count + 1.2)) * idf;
        vector[idx] = weight;
        sumSquares += weight * weight;
      }
    });

    const norm = Math.sqrt(sumSquares) || 1;
    const normalizedVector = {};
    for (const [idx, weight] of Object.entries(vector)) {
      normalizedVector[idx] = weight / norm;
    }
    return normalizedVector;
  }

  // Calculate Cosine Similarity between query vector and chunk vector
  calculateCosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB) return 0;
    let dotProduct = 0;
    for (const [idx, valA] of Object.entries(vecA)) {
      if (vecB[idx] !== undefined) {
        dotProduct += valA * vecB[idx];
      }
    }
    return dotProduct;
  }

  // Perform Hybrid Vector Search (Cosine Similarity + Exact Keyword Match Boost)
  searchSimilarChunks(query, options = {}) {
    if (!this.isInitialized || memoryDb.chunks.length === 0) {
      this.buildVectorIndex();
    }

    const {
      topK = memoryDb.systemSettings.topK || 4,
      threshold = memoryDb.systemSettings.similarityThreshold || 0.20,
      departmentFilter = null,
      categoryFilter = null
    } = options;

    const queryTokens = this.tokenize(query);
    const queryVector = this.vectorizeQuery(query);
    const scoredChunks = [];

    for (const chunk of memoryDb.chunks) {
      // Optional department / category filtering
      if (departmentFilter && departmentFilter !== 'All' && chunk.department !== departmentFilter) {
        continue;
      }
      if (categoryFilter && categoryFilter !== 'All' && chunk.category !== categoryFilter) {
        continue;
      }

      // 1. Vector Cosine Similarity
      const cosineSim = this.calculateCosineSimilarity(queryVector, chunk.vector);

      // 2. Keyword Match / Term Coverage Bonus
      const chunkLower = chunk.text.toLowerCase();
      let keywordHits = 0;
      for (const token of queryTokens) {
        if (chunkLower.includes(token)) {
          keywordHits++;
        }
      }
      const keywordRatio = queryTokens.length > 0 ? (keywordHits / queryTokens.length) : 0;

      // 3. Combined Hybrid Relevance Score (0.0 to 1.0)
      let combinedScore = (cosineSim * 0.70) + (keywordRatio * 0.30);

      // Boost if title matches
      if (chunk.documentTitle && queryTokens.some(t => chunk.documentTitle.toLowerCase().includes(t))) {
        combinedScore = Math.min(1.0, combinedScore + 0.15);
      }

      if (combinedScore >= threshold) {
        scoredChunks.push({
          ...chunk,
          score: parseFloat(combinedScore.toFixed(4)),
          cosineScore: parseFloat(cosineSim.toFixed(4)),
          keywordScore: parseFloat(keywordRatio.toFixed(4)),
          matchedKeywords: queryTokens.filter(t => chunkLower.includes(t))
        });
      }
    }

    // Sort by relevance score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    const topResults = scoredChunks.slice(0, topK);
    const maxScore = topResults.length > 0 ? topResults[0].score : 0;

    return {
      results: topResults,
      totalMatches: scoredChunks.length,
      topScore: maxScore,
      isRelevant: maxScore >= threshold && topResults.length > 0,
      queryTokens
    };
  }

  // Initialize and load default seed knowledge base if empty
  initializeKnowledgeBase() {
    if (memoryDb.documents.length === 0) {
      console.log('🌱 Seeding initial college knowledge base documents...');
      for (const doc of initialCollegeDocuments) {
        memoryDb.documents.push(doc);
        const chunks = this.chunkText(doc.content, 420, 80, {
          documentId: doc.id,
          documentTitle: doc.title,
          category: doc.category,
          department: doc.department
        });
        memoryDb.chunks.push(...chunks);
      }
      memoryDb.saveSnapshot();
    }
    this.buildVectorIndex();
  }

  // Generate Automatic FAQs from an uploaded document
  generateAutoFAQs(text, docTitle) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const faqs = [];

    lines.forEach(line => {
      if (line.startsWith('#') || line.startsWith('**') || line.includes(':')) {
        const clean = line.replace(/^[#\*\-\s]+|[\*\:]+$/g, '').trim();
        if (clean.length > 10 && clean.length < 80) {
          faqs.push(`What are the policies and guidelines regarding "${clean}"?`);
        }
      }
    });

    if (faqs.length === 0) {
      faqs.push(
        `What are the key requirements outlined in ${docTitle}?`,
        `Who should I contact regarding ${docTitle}?`,
        `What are the important deadlines or rules in this document?`
      );
    }

    return faqs.slice(0, 5);
  }
}

const ragService = new RAGService();

module.exports = ragService;
