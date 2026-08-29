const { memoryDb, isMongoConnected } = require('../config/db');
const ragService = require('../services/ragService');
const env = require('../config/env');

exports.getSettings = async (req, res) => {
  try {
    const settings = {
      aiProvider: memoryDb.systemSettings.aiProvider || 'gemini',
      modelName: memoryDb.systemSettings.modelName || 'gemini-1.5-flash',
      similarityThreshold: memoryDb.systemSettings.similarityThreshold || 0.20,
      topK: memoryDb.systemSettings.topK || 4,
      strictRAGGrounding: memoryDb.systemSettings.strictRAGGrounding !== false,
      hasGeminiKey: Boolean(memoryDb.systemSettings.geminiApiKey || env.GEMINI_API_KEY),
      hasOpenRouterKey: Boolean(memoryDb.systemSettings.openrouterApiKey || env.OPENROUTER_API_KEY),
      isMongoConnected: isMongoConnected(),
      totalChunksIndexed: memoryDb.chunks.length,
      totalDocuments: memoryDb.documents.length
    };

    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching settings: ' + err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {
      geminiApiKey,
      openrouterApiKey,
      aiProvider,
      modelName,
      similarityThreshold,
      topK,
      strictRAGGrounding
    } = req.body;

    if (geminiApiKey !== undefined) memoryDb.systemSettings.geminiApiKey = geminiApiKey.trim();
    if (openrouterApiKey !== undefined) memoryDb.systemSettings.openrouterApiKey = openrouterApiKey.trim();
    if (aiProvider !== undefined) memoryDb.systemSettings.aiProvider = aiProvider;
    if (modelName !== undefined) memoryDb.systemSettings.modelName = modelName;
    if (similarityThreshold !== undefined) memoryDb.systemSettings.similarityThreshold = parseFloat(similarityThreshold);
    if (topK !== undefined) memoryDb.systemSettings.topK = parseInt(topK, 10);
    if (strictRAGGrounding !== undefined) memoryDb.systemSettings.strictRAGGrounding = Boolean(strictRAGGrounding);

    memoryDb.saveSnapshot();

    res.json({
      message: 'Settings updated successfully!',
      settings: {
        aiProvider: memoryDb.systemSettings.aiProvider,
        modelName: memoryDb.systemSettings.modelName,
        similarityThreshold: memoryDb.systemSettings.similarityThreshold,
        topK: memoryDb.systemSettings.topK,
        strictRAGGrounding: memoryDb.systemSettings.strictRAGGrounding,
        hasGeminiKey: Boolean(memoryDb.systemSettings.geminiApiKey || env.GEMINI_API_KEY),
        hasOpenRouterKey: Boolean(memoryDb.systemSettings.openrouterApiKey || env.OPENROUTER_API_KEY)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error updating settings: ' + err.message });
  }
};

exports.rebuildIndex = async (req, res) => {
  try {
    ragService.buildVectorIndex();
    res.json({
      message: 'Vector index rebuilt successfully.',
      totalChunks: memoryDb.chunks.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Error rebuilding index: ' + err.message });
  }
};
