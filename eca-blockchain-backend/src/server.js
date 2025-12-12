const express = require('express');
const cors = require('cors');
const Blockchain = require('./blockchain/Blockchain');
const createAuthRoutes = require('./routes/authRoutes');
const createTransactionRoutes = require('./routes/transactionRoutes');
const createBlockchainRoutes = require('./routes/blockchainRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ecaBlockchain = new Blockchain();
console.log('ECA Blockchain initialized!');

app.use('/api/auth', createAuthRoutes(ecaBlockchain));
app.use('/api/transactions', createTransactionRoutes(ecaBlockchain));
app.use('/api/blockchain', createBlockchainRoutes(ecaBlockchain));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ECA Blockchain API is running',
    timestamp: new Date().toISOString(),
    blockchain: {
      blocks: ecaBlockchain.chain.length,
      pendingTransactions: ecaBlockchain.pendingTransactions.length,
      isValid: ecaBlockchain.isChainValid()
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 ECA Blockchain API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
