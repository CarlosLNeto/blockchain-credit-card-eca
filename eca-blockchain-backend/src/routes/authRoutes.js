const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const createAuthRoutes = (blockchain) => {
  const router = express.Router();

  router.post('/register', (req, res) => register(req, res, blockchain));
  router.post('/login', login);
  router.post('/logout', authMiddleware, logout);

  return router;
};

module.exports = createAuthRoutes;
