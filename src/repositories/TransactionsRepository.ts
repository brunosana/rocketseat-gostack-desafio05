import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const balance = { income: 0, outcome: 0, total: 0 } as Balance;

    if (transactions.length > 0) {
      transactions.map(transaction => {
        if (transaction.type === 'income') {
          balance.income += Number(transaction.value);
        } else {
          balance.outcome += Number(transaction.value);
        }
        return null;
      });
    }

    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
