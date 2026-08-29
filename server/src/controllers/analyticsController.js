const analyticsService = require('../services/analyticsService');
const { memoryDb } = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const stats = analyticsService.getDashboardStats();
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching analytics: ' + err.message });
  }
};

exports.resolveUnresolvedQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'resolved' } = req.body;

    const item = memoryDb.unresolvedQueries.find(q => q.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Query not found in queue' });
    }

    item.status = status;
    item.resolvedAt = new Date().toISOString();
    memoryDb.saveSnapshot();

    res.json({ message: 'Query marked as resolved', item });
  } catch (err) {
    res.status(500).json({ error: 'Error resolving query: ' + err.message });
  }
};
