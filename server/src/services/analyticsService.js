const { memoryDb } = require('../config/db');

class AnalyticsService {
  logQueryEvent(event) {
    const entry = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      query: event.query,
      department: event.department || 'General',
      category: event.category || 'General',
      topScore: event.topScore || 0,
      isGrounded: event.isGrounded !== false,
      sourcesCount: event.sourcesCount || 0,
      responseTimeMs: event.responseTimeMs || 150,
      userId: event.userId || 'anonymous',
      userName: event.userName || 'Student User',
      feedback: null, // 'up' | 'down' | null
      feedbackNote: '',
      timestamp: new Date().toISOString()
    };

    memoryDb.analytics.unshift(entry);
    // Keep last 1000 events
    if (memoryDb.analytics.length > 1000) {
      memoryDb.analytics.pop();
    }

    if (!event.isGrounded) {
      this.logUnresolvedQuery(event.query, event.category, event.userId);
    }

    memoryDb.saveSnapshot();
    return entry;
  }

  logUnresolvedQuery(query, category = 'General', userId = 'anonymous') {
    const existing = memoryDb.unresolvedQueries.find(q => q.query.toLowerCase() === query.toLowerCase());
    if (existing) {
      existing.askCount = (existing.askCount || 1) + 1;
      existing.lastAskedAt = new Date().toISOString();
    } else {
      memoryDb.unresolvedQueries.push({
        id: `unres-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        query,
        category,
        userId,
        askCount: 1,
        status: 'pending', // 'pending' | 'resolved' | 'faq_added'
        createdAt: new Date().toISOString(),
        lastAskedAt: new Date().toISOString()
      });
    }
  }

  recordFeedback(eventId, feedback, feedbackNote = '') {
    const entry = memoryDb.analytics.find(a => a.id === eventId);
    if (entry) {
      entry.feedback = feedback; // 'up' | 'down'
      entry.feedbackNote = feedbackNote;
      memoryDb.saveSnapshot();
      return entry;
    }
    return null;
  }

  getDashboardStats() {
    const all = memoryDb.analytics;
    const totalQueries = all.length;
    const positiveCount = all.filter(a => a.feedback === 'up').length;
    const negativeCount = all.filter(a => a.feedback === 'down').length;
    const groundedCount = all.filter(a => a.isGrounded).length;

    const avgLatency = totalQueries > 0
      ? Math.round(all.reduce((acc, a) => acc + (a.responseTimeMs || 0), 0) / totalQueries)
      : 0;

    const satisfactionRate = (positiveCount + negativeCount > 0)
      ? Math.round((positiveCount / (positiveCount + negativeCount)) * 100)
      : 96; // Initial baseline

    // Department breakdown
    const deptCounts = {};
    all.forEach(a => {
      const dept = a.department || 'General';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    // Top asked questions
    const queryCounts = {};
    all.forEach(a => {
      const q = a.query.trim().toLowerCase();
      queryCounts[q] = (queryCounts[q] || 0) + 1;
    });

    const topQueries = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([query, count]) => ({ query, count }));

    return {
      totalQueries,
      groundedQueries: groundedCount,
      groundedRate: totalQueries > 0 ? Math.round((groundedCount / totalQueries) * 100) : 100,
      positiveFeedback: positiveCount,
      negativeFeedback: negativeCount,
      satisfactionRate,
      avgLatencyMs: avgLatency,
      totalDocuments: memoryDb.documents.length,
      totalChunks: memoryDb.chunks.length,
      unresolvedCount: memoryDb.unresolvedQueries.filter(q => q.status === 'pending').length,
      departmentStats: deptCounts,
      topQueries,
      recentQueries: all.slice(0, 15),
      unresolvedList: memoryDb.unresolvedQueries.slice(0, 15)
    };
  }
}

const analyticsService = new AnalyticsService();

module.exports = analyticsService;
