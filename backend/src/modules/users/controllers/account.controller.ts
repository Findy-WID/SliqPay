import { Request, Response } from 'express';
import { AccountRepositoryPrisma } from '../repositories/account.prisma.repository.js';

export const createAccount = async (req: Request, res: Response) => {
  const { userId, currency } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  // Enforce starting balance of 25,000 for all new accounts
  const account = await AccountRepositoryPrisma.create({ userId, balance: 25000, currency });
  res.status(201).json({ account });
};

export const getAccountsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const accounts = await AccountRepositoryPrisma.findByUserId(userId);
  res.json({ accounts });
};

export const getAccountById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const account = await AccountRepositoryPrisma.findById(id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json({ account });
};

export const updateAccountBalance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { balance } = req.body;
  if (typeof balance !== 'number') return res.status(400).json({ error: 'balance must be a number' });
  const account = await AccountRepositoryPrisma.updateBalance(id, balance);
  res.json({ account });
};
