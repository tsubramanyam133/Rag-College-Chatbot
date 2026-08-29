const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = { id: 'anonymous', role: 'guest', name: 'Student Guest' };
    return next();
  }

  jwt.verify(token, env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { id: 'anonymous', role: 'guest', name: 'Student Guest' };
      return next();
    }
    req.user = user;
    next();
  });
};

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }

  jwt.verify(token, env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token. Please login again.' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Admin privileges required for this action.' });
    }
  });
};

module.exports = {
  authenticateToken,
  requireAuth,
  requireAdmin
};
