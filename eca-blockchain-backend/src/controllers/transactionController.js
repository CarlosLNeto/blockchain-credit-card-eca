const Transaction = require('../blockchain/Transaction');
const Invoice = require('../models/Invoice');
const db = require('../config/database');

const transfer = (req, res, blockchain) => {
  try {
    const { toEmail, amount, description } = req.body;
    const fromAddress = req.userWalletAddress;

    if (!toEmail || !amount) {
      return res.status(400).json({ error: 'Recipient email and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const recipient = db.findUserByEmail(toEmail);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const sender = db.findUserByWalletAddress(fromAddress);
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (sender.email === recipient.email) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    const balance = blockchain.getBalanceOfAddress(fromAddress);
    if (balance < amount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        currentBalance: balance,
        required: amount
      });
    }

    const transaction = new Transaction(
      fromAddress,
      recipient.walletAddress,
      amount,
      'TRANSFER',
      description || 'Transfer to ' + recipient.name,
      'ECA'
    );

    blockchain.addTransaction(transaction);
    blockchain.minePendingTransactions('SYSTEM');

    return res.status(200).json({
      message: 'Transfer successful',
      transaction: transaction,
      newBalance: blockchain.getBalanceOfAddress(fromAddress)
    });
  } catch (error) {
    console.error('Transfer error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const payment = (req, res, blockchain) => {
  try {
    const { merchantName, amount, description, installments } = req.body;
    const fromAddress = req.userWalletAddress;

    if (!merchantName || !amount) {
      return res.status(400).json({ error: 'Merchant name and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const numInstallments = installments || 1;
    if (numInstallments < 1 || numInstallments > 24) {
      return res.status(400).json({ error: 'Installments must be between 1 and 24' });
    }

    const sender = db.findUserByWalletAddress(fromAddress);
    if (!sender) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Aplicar juros para parcelamentos acima de 3x
    let totalAmount = amount;
    let interestRate = 0;
    
    if (numInstallments > 3) {
      interestRate = 2.5; // 2.5% ao mês
      const monthlyInterest = (interestRate / 100);
      // Fórmula de juros compostos
      totalAmount = amount * Math.pow(1 + monthlyInterest, numInstallments);
      totalAmount = Math.round(totalAmount * 100) / 100; // Arredondar para 2 casas decimais
    }

    const balance = blockchain.getBalanceOfAddress(fromAddress);
    const installmentAmount = totalAmount / numInstallments;

    if (balance < installmentAmount) {
      return res.status(400).json({ 
        error: 'Insufficient balance for first installment',
        currentBalance: balance,
        required: installmentAmount
      });
    }

    const transaction = new Transaction(
      fromAddress,
      'MERCHANT',
      totalAmount,
      numInstallments > 1 ? 'INSTALLMENT_PAYMENT' : 'PAYMENT',
      description || 'Payment to ' + merchantName,
      'ECA',
      numInstallments
    );

    if (interestRate > 0) {
      transaction.interestRate = interestRate;
    }

    blockchain.addTransaction(transaction);
    blockchain.minePendingTransactions('SYSTEM');

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    let invoice = db.findInvoiceByUserAndMonth(sender.id, month, year);
    
    if (!invoice) {
      invoice = new Invoice(sender.id, month, year);
      db.addInvoice(invoice);
    }
    
    invoice.addTransaction(transaction);
    db.updateInvoice(invoice);

    const responseData = {
      message: 'Payment successful',
      transaction: transaction,
      installments: numInstallments,
      installmentAmount: installmentAmount,
      originalAmount: amount,
      totalAmount: totalAmount,
      newBalance: blockchain.getBalanceOfAddress(fromAddress)
    };

    if (interestRate > 0) {
      responseData.interestRate = interestRate;
      responseData.interestAmount = totalAmount - amount;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const getBalance = (req, res, blockchain) => {
  try {
    const address = req.userWalletAddress;
    const balance = blockchain.getBalanceOfAddress(address);
    
    const user = db.findUserByWalletAddress(address);
    
    return res.status(200).json({
      balance: balance,
      creditLimit: user ? user.creditLimit : 0,
      available: balance,
      used: user ? user.creditLimit - balance : 0
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getStatement = (req, res, blockchain) => {
  try {
    const address = req.userWalletAddress;
    const transactions = blockchain.getAllTransactionsForAddress(address);
    
    const enrichedTransactions = transactions.map(tx => {
      let otherParty = '';
      let transactionType = tx.type;
      
      if (tx.fromAddress === address) {
        const recipient = db.findUserByWalletAddress(tx.toAddress);
        otherParty = recipient ? recipient.name : tx.toAddress;
        transactionType = tx.type === 'TRANSFER' ? 'SENT' : tx.type;
      } else if (tx.toAddress === address) {
        const sender = db.findUserByWalletAddress(tx.fromAddress);
        otherParty = sender ? sender.name : (tx.fromAddress || 'SYSTEM');
        transactionType = tx.type === 'TRANSFER' ? 'RECEIVED' : tx.type;
      }
      
      return {
        ...tx,
        otherParty,
        transactionType
      };
    });

    return res.status(200).json({
      transactions: enrichedTransactions,
      totalTransactions: enrichedTransactions.length,
      currentBalance: blockchain.getBalanceOfAddress(address)
    });
  } catch (error) {
    console.error('Get statement error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getStatementByPeriod = (req, res, blockchain) => {
  try {
    const address = req.userWalletAddress;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const transactions = blockchain.getTransactionsByPeriod(address, start, end);
    
    const enrichedTransactions = transactions.map(tx => {
      let otherParty = '';
      let transactionType = tx.type;
      
      if (tx.fromAddress === address) {
        const recipient = db.findUserByWalletAddress(tx.toAddress);
        otherParty = recipient ? recipient.name : tx.toAddress;
        transactionType = tx.type === 'TRANSFER' ? 'SENT' : tx.type;
      } else if (tx.toAddress === address) {
        const sender = db.findUserByWalletAddress(tx.fromAddress);
        otherParty = sender ? sender.name : (tx.fromAddress || 'SYSTEM');
        transactionType = tx.type === 'TRANSFER' ? 'RECEIVED' : tx.type;
      }
      
      return {
        ...tx,
        otherParty,
        transactionType
      };
    });

    return res.status(200).json({
      transactions: enrichedTransactions,
      totalTransactions: enrichedTransactions.length,
      period: { startDate, endDate },
      currentBalance: blockchain.getBalanceOfAddress(address)
    });
  } catch (error) {
    console.error('Get statement by period error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  transfer,
  payment,
  getBalance,
  getStatement,
  getStatementByPeriod
};
