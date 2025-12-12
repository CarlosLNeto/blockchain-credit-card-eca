const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const Transaction = require('../blockchain/Transaction');

const register = (req, res, blockchain) => {
  try {
    const { name, email, cpf, password } = req.body;

    if (!name || !email || !cpf || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (db.findUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (db.findUserByCPF(cpf)) {
      return res.status(400).json({ error: 'CPF already exists' });
    }

    const user = new User(name, email, cpf, password);
    db.addUser(user);

    const initialCredit = new Transaction(
      null,
      user.walletAddress,
      user.creditLimit,
      'CREDIT',
      'Initial Credit Limit',
      user.cardBrand
    );
    initialCredit.approve();
    blockchain.pendingTransactions.push(initialCredit);
    blockchain.minePendingTransactions('SYSTEM');

    const token = jwt.sign(
      { id: user.id, walletAddress: user.walletAddress },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    db.addSession(token, user.id);

    return res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, walletAddress: user.walletAddress },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    db.addSession(token, user.id);

    return res.status(200).json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      db.removeSession(token);
    }

    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { register, login, logout };
