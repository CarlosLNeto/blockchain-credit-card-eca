const { v4: uuidv4 } = require('uuid');

class Invoice {
  constructor(userId, month, year) {
    this.id = uuidv4();
    this.userId = userId;
    this.month = month; // 1-12
    this.year = year;
    this.transactions = [];
    this.totalAmount = 0;
    this.paidAmount = 0;
    this.dueDate = this.calculateDueDate(month, year);
    this.closingDate = this.calculateClosingDate(month, year);
    this.status = 'OPEN'; // OPEN, CLOSED, PAID, OVERDUE
    this.minimumPayment = 0;
    this.interestRate = 2.5; // Taxa de juros mensal
    this.lateInterestRate = 5.0; // Taxa de juros por atraso
    this.createdAt = Date.now();
  }

  calculateClosingDate(month, year) {
    // Data de fechamento: dia 5 de cada mês
    const date = new Date(year, month - 1, 5);
    return date.getTime();
  }

  calculateDueDate(month, year) {
    // Vencimento: dia 15 de cada mês
    const date = new Date(year, month - 1, 15);
    return date.getTime();
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
    this.totalAmount += transaction.amount;
    this.minimumPayment = this.totalAmount * 0.15; // 15% do total
  }

  pay(amount) {
    this.paidAmount += amount;
    if (this.paidAmount >= this.totalAmount) {
      this.status = 'PAID';
    }
  }

  close() {
    this.status = 'CLOSED';
    if (Date.now() > this.dueDate && this.paidAmount < this.totalAmount) {
      this.status = 'OVERDUE';
      this.applyLateInterest();
    }
  }

  applyLateInterest() {
    const unpaidAmount = this.totalAmount - this.paidAmount;
    const interest = unpaidAmount * (this.lateInterestRate / 100);
    this.totalAmount += interest;
    this.minimumPayment = this.totalAmount * 0.15;
  }

  getRemainingBalance() {
    return this.totalAmount - this.paidAmount;
  }

  getInstallmentsForMonth() {
    return this.transactions.filter(t => t.installments > 1);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      month: this.month,
      year: this.year,
      transactions: this.transactions,
      totalAmount: this.totalAmount,
      paidAmount: this.paidAmount,
      remainingBalance: this.getRemainingBalance(),
      dueDate: this.dueDate,
      closingDate: this.closingDate,
      status: this.status,
      minimumPayment: this.minimumPayment,
      interestRate: this.interestRate,
      lateInterestRate: this.lateInterestRate,
      createdAt: this.createdAt
    };
  }
}

module.exports = Invoice;
