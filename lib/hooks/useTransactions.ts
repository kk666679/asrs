import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useTransactionStore } from '@/lib/stores/transactions';

interface Transaction {
  id: string;
  type: string;
  status: string;
  itemId: string;
  quantity: number;
  sourceLocation?: string;
  destinationLocation?: string;
  userId: string;
  timestamp: Date;
  notes?: string;
}

const fetchTransactions = async () => {
  return apiClient.transactions.getAll() as Promise<Transaction[]>;
};

const createTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  return apiClient.transactions.create(transaction) as Promise<Transaction>;
};

export const useTransactions = () => {
  const queryClient = useQueryClient();
  const store = useTransactionStore();

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (transactions) {
      store.setTransactions(transactions);
      store.setLoading(false);
      store.setError(null);
    }
  }, [transactions, store]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
      store.setLoading(false);
    }
  }, [error, store]);

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (newTransaction) => {
      store.addTransaction(newTransaction);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    transactions: transactions || store.transactions,
    filteredTransactions: store.filteredTransactions,
    transactionStats: store.transactionStats,
    isLoading: isLoading || store.loading,
    error: error?.message || store.error,
    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    createTransaction: createMutation.mutate,
    refreshTransactions: refetch,
    isCreating: createMutation.isPending,
  };
};