// backend/middleware/collaborationAuth.js
// Create this NEW file first

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Handle different token structures
    const userId = decoded.userId || decoded.id || decoded._id;
    const username = decoded.username || decoded.name || decoded.email;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    req.user = {
      _id: userId,
      id: userId,
      username: username
    };

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };