const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(name, email, cpf, password) {
    this.id = uuidv4();
    this.name = name;
    this.email = email;
    this.cpf = cpf;
    this.password = this.hashPassword(password);
    this.walletAddress = this.generateWalletAddress();
    this.cardNumber = this.generateCardNumber();
    this.cardBrand = 'ECA';
    this.cvv = this.generateCVV();
    this.expirationDate = this.generateExpirationDate();
    this.creditLimit = 5000;
    this.createdAt = Date.now();
  }

  hashPassword(password) {
    return bcrypt.hashSync(password, 10);
  }

  comparePassword(password) {
    return bcrypt.compareSync(password, this.password);
  }

  generateWalletAddress() {
    return crypto
      .createHash('sha256')
      .update(this.email + Date.now())
      .digest('hex')
      .substring(0, 40);
  }

  generateCardNumber() {
    const prefix = '5100'; // Prefixo exclusivo da bandeira ECA
    const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return prefix + random;
  }

  generateCVV() {
    return Math.floor(Math.random() * 900 + 100).toString();
  }

  generateExpirationDate() {
    const now = new Date();
    now.setFullYear(now.getFullYear() + 5);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().substring(2);
    return `${month}/${year}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      cpf: this.cpf,
      walletAddress: this.walletAddress,
      cardNumber: this.cardNumber,
      cardBrand: this.cardBrand,
      cvv: this.cvv,
      expirationDate: this.expirationDate,
      creditLimit: this.creditLimit,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
