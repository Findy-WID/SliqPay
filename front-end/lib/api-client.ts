// API Client with React Query Hooks for Web2 MVP
'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
});

// Types
export interface Balance {
  id: string;
  user_id: string;
  currency: string;
  amount: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  type: string;
  from_currency?: string;
  to_currency?: string;
  amount: string;
  rate?: string;
  fee?: string;
  status: string;
  description?: string;
  meta?: any;
  created_at: string;
  fromUser?: {
    id: string;
    sliq_id?: string;
    first_name?: string;
    last_name?: string;
  };
  toUser?: {
    id: string;
    sliq_id?: string;
    first_name?: string;
    last_name?: string;
  };
}

// Balances
export function useBalances() {
  return useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      const { data } = await api.get<{ balances: Balance[] }>('/balances');
      return data.balances;
    },
  });
}

export function useConversionPreview() {
  return useMutation({
    mutationFn: async (payload: { amount: number; from: string; to: string }) => {
      const { data } = await api.post('/balances/preview-convert', payload);
      return data;
    },
  });
}

// Send Money
export function useSendMoney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      recipientSliqId: string;
      fromCurrency: string;
      amount: number;
      recipientCurrency?: string;
    }) => {
      const { data } = await api.post('/send', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// Convert Currency
export function useConvert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      amount: number;
      fromCurrency: string;
      toCurrency: string;
    }) => {
      const { data } = await api.post('/convert', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// Purchase
export function usePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      product: string;
      serviceId: string;
      amount: number;
      currency: string;
      phone?: string;
      meterNumber?: string;
      smartCardNumber?: string;
      variation_code?: string;
    }) => {
      const { data } = await api.post('/purchase', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// Transactions
export function useTransactions(limit?: number) {
  return useQuery({
    queryKey: ['transactions', limit],
    queryFn: async () => {
      const { data } = await api.get<{ transactions: Transaction[] }>(
        `/transactions${limit ? `?limit=${limit}` : ''}`
      );
      return data.transactions;
    },
  });
}

// SliqID
export function useRegisterSliqId() {
  return useMutation({
    mutationFn: async (sliqId: string) => {
      const { data } = await api.post('/sliq/register', { sliqId });
      return data;
    },
  });
}

export function useLookupSliqId(sliqId: string, enabled = true) {
  return useQuery({
    queryKey: ['sliq', sliqId],
    queryFn: async () => {
      const { data } = await api.get(`/sliq/lookup/${sliqId}`);
      return data;
    },
    enabled: enabled && !!sliqId && sliqId.length > 5,
  });
}

// Supported Currencies
export function useSupportedCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data } = await api.get<{ currencies: string[] }>('/balances/currencies');
      return data.currencies;
    },
  });
}
