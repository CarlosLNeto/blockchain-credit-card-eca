const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'eca-blockchain-secret-key-2024';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token error' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token malformatted' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token invalid' });
      }

      const session = db.findSession(token);
      if (!session) {
        return res.status(401).json({ error: 'Session not found' });
      }

      req.userId = decoded.id;
      req.userWalletAddress = decoded.walletAddress;
      return next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { authMiddleware, JWT_SECRET };
