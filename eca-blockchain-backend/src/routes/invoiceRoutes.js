const express = require('express');
const {
  getCurrentInvoice,
  getInvoiceByMonth,
  getAllInvoices,
  payInvoice
} = require('../controllers/invoiceController');
const { authMiddleware } = require('../middleware/auth');

const createInvoiceRoutes = (blockchain) => {
  const router = express.Router();

  router.use(authMiddleware);

  router.get('/current', getCurrentInvoice);
  router.get('/all', getAllInvoices);
  router.get('/:month/:year', getInvoiceByMonth);
  router.post('/pay', (req, res) => payInvoice(req, res, blockchain));

  return router;
};

module.exports = createInvoiceRoutes;
