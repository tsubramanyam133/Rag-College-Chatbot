const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  sources: { type: Array, default: [] },
  confidenceScore: { type: Number, default: 0 },
  isGrounded: { type: Boolean, default: true },
  provider: { type: String, default: 'Grounded Engine' },
  model: { type: String, default: 'offline' },
  responseTimeMs: { type: Number, default: 0 },
  analyticsEventId: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
