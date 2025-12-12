class Database {
  constructor() {
    this.users = [];
    this.sessions = [];
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
}

const db = new Database();
module.exports = db;
