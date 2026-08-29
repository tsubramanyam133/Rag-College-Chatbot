const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/documentController');
const { authenticateToken, requireAdmin } = require('./authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocumentById);
router.post('/upload', authenticateToken, upload.single('file'), documentController.uploadDocument);
router.post('/create-direct', authenticateToken, documentController.createDocumentDirect);
router.delete('/:id', authenticateToken, documentController.deleteDocument);
router.get('/:id/summary', documentController.generateDocSummary);
router.get('/:id/faqs', documentController.generateDocFAQs);

module.exports = router;
