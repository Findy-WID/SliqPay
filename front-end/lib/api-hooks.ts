// React Query API Client for SliqPay Web2 MVP
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Balances API
export function useBalances() {
  return useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      const { data } = await api.get('/balances');
      return data.balances;
    }
  });
}

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data } = await api.get('/balances/currencies');
      return data.currencies;
    }
  });
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['rates'],
    queryFn: async () => {
      const { data } = await api.get('/balances/rates');
      return data.rates;
    }
  });
}

// Send Money API
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
    }
  });
}

// Convert Currency API
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
    }
  });
}

export function usePreviewConversion() {
  return useMutation({
    mutationFn: async (payload: {
      amount: number;
      from: string;
      to: string;
    }) => {
      const { data } = await api.post('/balances/preview-convert', payload);
      return data;
    }
  });
}

// Purchase/Bill Payment API
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
      billersCode?: string;
    }) => {
      const { data } = await api.post('/purchase', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
}

// Transactions API
export function useTransactions(limit?: number) {
  return useQuery({
    queryKey: ['transactions', limit],
    queryFn: async () => {
      const { data } = await api.get('/transactions', {
        params: { limit }
      });
      return data.transactions;
    }
  });
}

// SliqID API
export function useRegisterSliqId() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sliqId: string) => {
      const { data } = await api.post('/sliq/register', { sliqId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
}

export function useLookupSliqId(sliqId: string, enabled = true) {
  return useQuery({
    queryKey: ['sliq', sliqId],
    queryFn: async () => {
      const { data } = await api.get(`/sliq/lookup/${sliqId}`);
      return data;
    },
    enabled: enabled && !!sliqId && sliqId.length > 5
  });
}

export function useGenerateSliqId() {
  return useQuery({
    queryKey: ['sliq-generate'],
    queryFn: async () => {
      const { data } = await api.get('/sliq/generate');
      return data.suggested;
    }
  });
}

// Auth API (for consistency)
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.user;
    },
    retry: false
  });
}

export { api };
