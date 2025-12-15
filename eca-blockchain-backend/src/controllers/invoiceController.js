const Invoice = require('../models/Invoice');
const db = require('../config/database');

const getCurrentInvoice = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = db.findSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const user = db.findUserById(session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    let invoice = db.findInvoiceByUserAndMonth(user.id, month, year);
    
    if (!invoice) {
      invoice = new Invoice(user.id, month, year);
      db.addInvoice(invoice);
    }
    
    return res.status(200).json({ invoice: invoice.toJSON() });
  } catch (error) {
    console.error('Get current invoice error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getInvoiceByMonth = (req, res) => {
  try {
    const { month, year } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = db.findSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const user = db.findUserById(session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const invoice = db.findInvoiceByUserAndMonth(user.id, parseInt(month), parseInt(year));
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found for this period' });
    }
    
    return res.status(200).json({ invoice: invoice.toJSON() });
  } catch (error) {
    console.error('Get invoice by month error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllInvoices = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = db.findSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const user = db.findUserById(session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const invoices = db.getInvoicesByUser(user.id);
    
    return res.status(200).json({
      invoices: invoices.map(inv => inv.toJSON()),
      total: invoices.length
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const payInvoice = (req, res, blockchain) => {
  try {
    const { invoiceId, amount } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = db.findSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const user = db.findUserById(session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    
    const invoice = db.invoices.find(inv => inv.id === invoiceId);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    if (invoice.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    invoice.pay(amount);
    db.updateInvoice(invoice);
    
    return res.status(200).json({
      message: 'Payment processed successfully',
      invoice: invoice.toJSON()
    });
  } catch (error) {
    console.error('Pay invoice error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCurrentInvoice,
  getInvoiceByMonth,
  getAllInvoices,
  payInvoice
};
