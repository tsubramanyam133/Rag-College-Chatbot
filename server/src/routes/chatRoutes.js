const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('./authMiddleware');

router.post('/query', authenticateToken, chatController.askQuestion);
router.get('/sessions', authenticateToken, chatController.getSessions);
router.post('/sessions', authenticateToken, chatController.createSession);
router.get('/sessions/:sessionId/messages', authenticateToken, chatController.getSessionMessages);
router.put('/sessions/:sessionId', authenticateToken, chatController.renameSession);
router.delete('/sessions/:sessionId', authenticateToken, chatController.deleteSession);
router.post('/feedback', chatController.recordFeedback);
router.get('/suggested-prompts', chatController.getSuggestedPrompts);

module.exports = router;
