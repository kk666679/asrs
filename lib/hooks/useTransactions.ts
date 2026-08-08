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

  // Select stable slices/actions individually to avoid unstable store references
  // that would otherwise trigger infinite re-render loops (zustand v5).
  const storeTransactions = useTransactionStore((s) => s.transactions);
  const storeLoading = useTransactionStore((s) => s.loading);
  const storeError = useTransactionStore((s) => s.error);
  const storeFilters = useTransactionStore((s) => s.filters);
  const setTransactions = useTransactionStore((s) => s.setTransactions);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const setLoading = useTransactionStore((s) => s.setLoading);
  const setError = useTransactionStore((s) => s.setError);
  const setFilters = useTransactionStore((s) => s.setFilters);
  const clearFilters = useTransactionStore((s) => s.clearFilters);

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (transactions) {
      setTransactions(transactions);
      setLoading(false);
      setError(null);
    }
  }, [transactions, setTransactions, setLoading, setError]);

  React.useEffect(() => {
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }, [error, setError, setLoading]);

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (newTransaction) => {
      addTransaction(newTransaction);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const filteredTransactions = React.useMemo(() => {
    const source = transactions || storeTransactions;
    return source.filter((transaction) => {
      const matchesType = !storeFilters.type || transaction.type === storeFilters.type;
      const matchesStatus = !storeFilters.status || transaction.status === storeFilters.status;
      const matchesSearch =
        !storeFilters.search ||
        transaction.id.toLowerCase().includes(storeFilters.search.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(storeFilters.search.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [transactions, storeTransactions, storeFilters]);

  const transactionStats = React.useMemo(() => {
    const source = transactions || storeTransactions;
    return {
      total: source.length,
      completed: source.filter((t) => t.status === 'COMPLETED').length,
      pending: source.filter((t) => t.status === 'PENDING').length,
      failed: source.filter((t) => t.status === 'FAILED').length,
    };
  }, [transactions, storeTransactions]);

  return {
    transactions: transactions || storeTransactions,
    filteredTransactions,
    transactionStats,
    isLoading: isLoading || storeLoading,
    error: error?.message || storeError,
    filters: storeFilters,
    setFilters,
    clearFilters,
    createTransaction: createMutation.mutate,
    refreshTransactions: refetch,
    isCreating: createMutation.isPending,
  };
};
