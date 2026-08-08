import { create } from 'zustand';
import { InventoryItem, InventoryFilters } from '@/lib/types';

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  filters: InventoryFilters;

  // Actions
  setItems: (items: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<InventoryFilters>) => void;
  clearFilters: () => void;

  // Computed functions
  getFilteredItems: () => InventoryItem[];
  getInventoryStats: () => {
    total: number;
    totalValue: number;
    lowStock: number;
    outOfStock: number;
    overStock: number;
    byCategory: Record<string, number>;
    bySupplier: Record<string, number>;
  };
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    supplier: 'all',
    status: 'all',
    search: '',
  },

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity, lastCounted: new Date() } : item
      ),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () =>
    set({
      filters: {
        category: 'all',
        supplier: 'all',
        status: 'all',
        search: '',
      },
    }),

  getFilteredItems: () => {
    const { items, filters } = get();
    return items.filter((item) => {
      const matchesCategory = !filters.category || filters.category === 'all' || item.category === filters.category;
      const matchesSupplier = !filters.supplier || filters.supplier === 'all' || item.supplierId === filters.supplier;
      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      const matchesSearch =
        !filters.search ||
        item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.sku?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.category?.toLowerCase().includes(filters.search.toLowerCase());

      return matchesCategory && matchesSupplier && matchesStatus && matchesSearch;
    });
  },

  getInventoryStats: () => {
    const { items } = get();
    const total = items.length;
    const totalValue = items.reduce((sum, item) => sum + ((item.weight || 0) * (item.quantity || 0)), 0);
    const lowStock = items.filter((item) => (item.quantity || 0) <= (item.minStock || 0)).length;
    const outOfStock = items.filter((item) => (item.quantity || 0) === 0).length;
    const overStock = items.filter((item) => item.maxStock && (item.quantity || 0) > item.maxStock).length;

    const byCategory = items.reduce((acc, item) => {
      const category = item.category || 'Unknown';
      acc[category] = (acc[category] || 0) + (item.quantity || 0);
      return acc;
    }, {} as Record<string, number>);

    const bySupplier = items.reduce((acc, item) => {
      const supplier = item.supplierId || 'Unknown';
      acc[supplier] = (acc[supplier] || 0) + (item.quantity || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      totalValue,
      lowStock,
      outOfStock,
      overStock,
      byCategory,
      bySupplier,
    };
  },
}));
