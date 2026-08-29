const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, default: 'anonymous' },
  title: { type: String, default: 'New Conversation' },
  department: { type: String, default: 'All' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
