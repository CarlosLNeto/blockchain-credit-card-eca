const Block = require('./Block');
const Transaction = require('./Transaction');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 10;
  }

  createGenesisBlock() {
    return new Block(Date.now(), [], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);
    
    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward, 'MINING_REWARD', 'Mining Reward')
    ];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }

    const balance = this.getBalanceOfAddress(transaction.fromAddress);
    if (balance < transaction.amount) {
      throw new Error('Not enough balance');
    }

    transaction.approve();
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    for (const trans of this.pendingTransactions) {
      if (trans.fromAddress === address) {
        balance -= trans.amount;
      }

      if (trans.toAddress === address) {
        balance += trans.amount;
      }
    }

    return balance;
  }

  getAllTransactionsForAddress(address) {
    const transactions = [];

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address || trans.toAddress === address) {
          transactions.push({
            ...trans,
            blockHash: block.hash,
            blockTimestamp: block.timestamp
          });
        }
      }
    }

    return transactions;
  }

  getTransactionsByPeriod(address, startDate, endDate) {
    const allTransactions = this.getAllTransactionsForAddress(address);
    return allTransactions.filter(tx => {
      return tx.timestamp >= startDate && tx.timestamp <= endDate;
    });
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

module.exports = Blockchain;
