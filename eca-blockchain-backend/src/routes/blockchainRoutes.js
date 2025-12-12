const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const createBlockchainRoutes = (blockchain) => {
  const router = express.Router();

  router.get('/chain', authMiddleware, (req, res) => {
    try {
      return res.status(200).json({
        chain: blockchain.chain,
        length: blockchain.chain.length,
        isValid: blockchain.isChainValid()
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/pending', authMiddleware, (req, res) => {
    try {
      return res.status(200).json({
        pendingTransactions: blockchain.pendingTransactions,
        count: blockchain.pendingTransactions.length
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/validate', authMiddleware, (req, res) => {
    try {
      const isValid = blockchain.isChainValid();
      return res.status(200).json({
        valid: isValid,
        message: isValid ? 'Blockchain is valid' : 'Blockchain is invalid'
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};

module.exports = createBlockchainRoutes;
