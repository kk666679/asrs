import { create } from 'zustand';

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

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  filters: {
    type?: string;
    status?: string;
    search?: string;
  };

  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<TransactionState['filters']>) => void;
  clearFilters: () => void;

  get filteredTransactions(): Transaction[];
  get transactionStats(): {
    total: number;
    completed: number;
    pending: number;
    failed: number;
  };
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  filters: {},

  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({ transactions: [...state.transactions, transaction] })),
  updateTransaction: (id, updates) => set((state) => ({
    transactions: state.transactions.map((t) => t.id === id ? { ...t, ...updates } : t)
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  clearFilters: () => set({ filters: {} }),

  get filteredTransactions() {
    const { transactions, filters } = get();
    return transactions.filter((transaction) => {
      const matchesType = !filters.type || transaction.type === filters.type;
      const matchesStatus = !filters.status || transaction.status === filters.status;
      const matchesSearch = !filters.search || 
        transaction.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(filters.search.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  },

  get transactionStats() {
    const { transactions } = get();
    return {
      total: transactions.length,
      completed: transactions.filter(t => t.status === 'COMPLETED').length,
      pending: transactions.filter(t => t.status === 'PENDING').length,
      failed: transactions.filter(t => t.status === 'FAILED').length,
    };
  },
}));