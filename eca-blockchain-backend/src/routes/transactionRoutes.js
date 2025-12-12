const express = require('express');
const {
  transfer,
  payment,
  getBalance,
  getStatement,
  getStatementByPeriod
} = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/auth');

const createTransactionRoutes = (blockchain) => {
  const router = express.Router();

  router.use(authMiddleware);

  router.post('/transfer', (req, res) => transfer(req, res, blockchain));
  router.post('/payment', (req, res) => payment(req, res, blockchain));
  router.get('/balance', (req, res) => getBalance(req, res, blockchain));
  router.get('/statement', (req, res) => getStatement(req, res, blockchain));
  router.get('/statement/period', (req, res) => getStatementByPeriod(req, res, blockchain));

  return router;
};

module.exports = createTransactionRoutes;
