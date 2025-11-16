import { api } from './api';

export type Account = {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  account_id: string;
  amount: number;
  type: 'debit' | 'credit';
  description?: string | null;
  created_at: string;
};

export async function getAccountsByUser(userId: string): Promise<{ accounts: Account[] }> {
  return api(`/account/user/${userId}`);
}

export async function getAccountById(id: string): Promise<{ account: Account }>{
  return api(`/account/${id}`);
}

export async function createAccount(userId: string, currency = 'NGN'): Promise<{ account: Account }>{
  return api(`/account`, {
    method: 'POST',
    body: JSON.stringify({ userId, currency })
  });
}

export async function getTransactionsByAccount(accountId: string): Promise<{ transactions: Transaction[] }>{
  return api(`/transaction/account/${accountId}`);
}

export async function getTransactionById(id: string): Promise<{ transaction: Transaction }>{
  return api(`/transaction/${id}`);
}

export async function createTransaction(params: { accountId: string; amount: number; type: 'debit' | 'credit'; description?: string }): Promise<{ transaction: Transaction; account: Account }>{
  return api(`/transaction`, {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
