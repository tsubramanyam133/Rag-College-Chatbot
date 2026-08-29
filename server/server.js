const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./src/config/env');
const { connectDB } = require('./src/config/db');
const ragService = require('./src/services/ragService');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

const app = express();

// Security and Logging Middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusBrain RAG Backend Server',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Welcome to CampusBrain AI - Full-Stack RAG College Assistant API',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat/query',
      documents: '/api/documents',
      analytics: '/api/analytics/stats',
      settings: '/api/settings',
      auth: '/api/auth'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Server Initialization
const startServer = async () => {
  try {
    // 1. Connect to Database (MongoDB or In-memory fallback)
    await connectDB();

    // 2. Initialize and vector index knowledge base
    ragService.initializeKnowledgeBase();

    // 3. Start Express Listener
    const server = app.listen(env.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 CampusBrain RAG Backend is running on port ${env.PORT}`);
      console.log(`🔗 API Base: http://localhost:${env.PORT}`);
      console.log(`🩺 Health Check: http://localhost:${env.PORT}/api/health`);
      console.log(`======================================================\n`);
    });

    return server;
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
