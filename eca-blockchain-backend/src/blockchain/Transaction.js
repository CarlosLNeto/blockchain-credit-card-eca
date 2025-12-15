const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  constructor(fromAddress, toAddress, amount, type = 'TRANSFER', description = '', cardBrand = 'ECA', installments = 1) {
    this.id = uuidv4();
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.type = type; // TRANSFER, PAYMENT, CREDIT, DEBIT, INSTALLMENT_PAYMENT
    this.description = description;
    this.cardBrand = cardBrand;
    this.timestamp = Date.now();
    this.status = 'PENDING';
    this.installments = installments || 1;
    this.installmentAmount = installments > 1 ? (amount / installments) : amount;
    this.currentInstallment = 1;
    this.parentTransactionId = null;
    this.interestRate = 0;
    this.dueDate = null;
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.fromAddress +
        this.toAddress +
        this.amount +
        this.timestamp +
        this.type
      )
      .digest('hex');
  }

  isValid() {
    if (this.fromAddress === null) return true;
    if (!this.fromAddress || !this.toAddress) {
      return false;
    }
    if (this.amount <= 0) {
      return false;
    }
    return true;
  }

  approve() {
    this.status = 'APPROVED';
  }

  reject() {
    this.status = 'REJECTED';
  }

  setDueDate(date) {
    this.dueDate = date;
  }

  applyInterest(rate) {
    this.interestRate = rate;
    this.amount = this.amount * (1 + rate / 100);
  }
}

module.exports = Transaction;
