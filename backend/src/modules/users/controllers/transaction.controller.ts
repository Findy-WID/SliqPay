import { Request, Response } from 'express';
import { TransactionRepositoryPrisma } from '../repositories/transaction.prisma.repository.js';
import { AccountRepositoryPrisma } from '../repositories/account.prisma.repository.js';

export const createTransaction = async (req: Request, res: Response) => {
  const { accountId, amount, type, description } = req.body;
  if (!accountId || typeof amount !== 'number' || !type) {
    return res.status(400).json({ error: 'accountId, amount, and type are required' });
  }
  try {
    const transaction = await TransactionRepositoryPrisma.create({ accountId, amount, type, description });
    const account = await AccountRepositoryPrisma.findById(accountId);
    res.status(201).json({ transaction, account });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Failed to create transaction' });
  }
};

export const getTransactionsByAccount = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  if (!accountId) return res.status(400).json({ error: 'accountId is required' });
  const transactions = await TransactionRepositoryPrisma.findByAccountId(accountId);
  res.json({ transactions });
};

export const getTransactionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transaction = await TransactionRepositoryPrisma.findById(id);
  if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ transaction });
};
