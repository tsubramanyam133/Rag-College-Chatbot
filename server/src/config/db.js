const mongoose = require('mongoose');
const env = require('./env');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;

// Local JSON backup store for in-memory / zero-config mode
const DATA_STORE_PATH = path.join(__dirname, '../../data-store.json');

class InMemoryDB {
  constructor() {
    this.users = [];
    this.documents = [];
    this.chunks = [];
    this.sessions = [];
    this.messages = [];
    this.analytics = [];
    this.unresolvedQueries = [];
    this.systemSettings = {
      aiProvider: 'gemini',
      geminiApiKey: env.GEMINI_API_KEY,
      openrouterApiKey: env.OPENROUTER_API_KEY,
      modelName: 'gemini-1.5-flash',
      similarityThreshold: env.SIMILARITY_THRESHOLD,
      topK: env.TOP_K_RESULTS,
      strictRAGGrounding: true
    };
    this.loadSnapshot();
  }

  loadSnapshot() {
    try {
      if (fs.existsSync(DATA_STORE_PATH)) {
        const raw = fs.readFileSync(DATA_STORE_PATH, 'utf8');
        const data = JSON.parse(raw);
        this.users = data.users || [];
        this.documents = data.documents || [];
        this.chunks = data.chunks || [];
        this.sessions = data.sessions || [];
        this.messages = data.messages || [];
        this.analytics = data.analytics || [];
        this.unresolvedQueries = data.unresolvedQueries || [];
        if (data.systemSettings) {
          this.systemSettings = { ...this.systemSettings, ...data.systemSettings };
        }
      }
    } catch (err) {
      console.warn('⚠️ Could not load data-store.json, starting with fresh in-memory DB.');
    }
  }

  saveSnapshot() {
    try {
      const data = {
        users: this.users,
        documents: this.documents,
        chunks: this.chunks,
        sessions: this.sessions,
        messages: this.messages,
        analytics: this.analytics,
        unresolvedQueries: this.unresolvedQueries,
        systemSettings: this.systemSettings
      };
      fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving data store snapshot:', err.message);
    }
  }
}

const memoryDb = new InMemoryDB();

const connectDB = async () => {
  if (env.MONGODB_URI && env.MONGODB_URI.startsWith('mongodb')) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully.');

      // Sync initial records to MongoDB Atlas
      try {
        const User = require('../models/User');
        const Document = require('../models/Document');
        const Session = require('../models/Session');
        
        for (const u of memoryDb.users) {
          await User.findOneAndUpdate({ id: u.id }, u, { upsert: true });
        }
        for (const d of memoryDb.documents) {
          await Document.findOneAndUpdate({ id: d.id }, d, { upsert: true });
        }
        console.log('📦 Synchronized memory/seed state with MongoDB Atlas collections.');
      } catch (syncErr) {
        console.warn('⚠️ Atlas initial sync notice:', syncErr.message);
      }
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed (' + err.message + '). Falling back to built-in In-Memory / Local JSON DB.');
    }
  } else {
    console.log('ℹ️ No MONGODB_URI provided in .env. Running in built-in In-Memory & Local JSON Store mode.');
  }
  isMongoConnected = false;
};

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  memoryDb
};
