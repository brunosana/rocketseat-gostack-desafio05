import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: string;
  category_name: string;
}

interface Response {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    type,
    category_name,
    title,
    value,
  }: Request): Promise<Transaction> {
    if (!type || (type !== 'income' && type !== 'outcome')) {
      throw new AppError('Invalid transaction type');
    }
    if (!category_name) {
      throw new AppError('Invalid transaction categoy');
    }
    if (!title) {
      throw new AppError('Invalid transaction title');
    }
    if (!value || value <= 0) {
      throw new AppError('Invalid transaction value');
    }

    const categoriesRepository = getRepository(Category);

    let category = await categoriesRepository.findOne({
      where: { title: category_name },
    });

    if (!category) {
      category = categoriesRepository.create({ title: category_name });
      await categoriesRepository.save(category);
    }

    const transactionsRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Must be a valid value', 400);
    }

    const transaction = transactionsRepository.create({
      category_id: category.id,
      title,
      type,
      value,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
