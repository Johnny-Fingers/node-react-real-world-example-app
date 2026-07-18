const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Token ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = db.prepare('SELECT id, username, email, bio, image FROM users WHERE id = ?').get(decoded.id);
  } catch {
    req.user = null;
  }

  next();
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Token ')) {
    return res.status(401).json({ errors: { body: ['Authorization required'] } });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = db.prepare('SELECT id, username, email, bio, image FROM users WHERE id = ?').get(decoded.id);

    if (!req.user) {
      return res.status(401).json({ errors: { body: ['User not found'] } });
    }
  } catch {
    return res.status(401).json({ errors: { body: ['Invalid token'] } });
  }

  next();
}

module.exports = { generateToken, optionalAuth, requireAuth };
