const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  constructor(fromAddress, toAddress, amount, type = 'TRANSFER', description = '', cardBrand = 'ECA') {
    this.id = uuidv4();
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.type = type;
    this.description = description;
    this.cardBrand = cardBrand;
    this.timestamp = Date.now();
    this.status = 'PENDING';
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
}

module.exports = Transaction;
