class Database {
  constructor() {
    this.users = [];
    this.sessions = [];
    this.invoices = [];
  }

  addUser(user) {
    this.users.push(user);
    return user;
  }

  findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  findUserByCPF(cpf) {
    return this.users.find(user => user.cpf === cpf);
  }

  findUserByWalletAddress(address) {
    return this.users.find(user => user.walletAddress === address);
  }

  findUserById(id) {
    return this.users.find(user => user.id === id);
  }

  addSession(token, userId) {
    this.sessions.push({ token, userId, createdAt: Date.now() });
  }

  findSession(token) {
    return this.sessions.find(session => session.token === token);
  }

  removeSession(token) {
    this.sessions = this.sessions.filter(session => session.token !== token);
  }

  getAllUsers() {
    return this.users;
  }

  addInvoice(invoice) {
    this.invoices.push(invoice);
    return invoice;
  }

  findInvoiceByUserAndMonth(userId, month, year) {
    return this.invoices.find(inv => 
      inv.userId === userId && inv.month === month && inv.year === year
    );
  }

  getInvoicesByUser(userId) {
    return this.invoices.filter(inv => inv.userId === userId);
  }

  updateInvoice(invoice) {
    const index = this.invoices.findIndex(inv => inv.id === invoice.id);
    if (index !== -1) {
      this.invoices[index] = invoice;
    }
    return invoice;
  }
}

const db = new Database();
module.exports = db;
