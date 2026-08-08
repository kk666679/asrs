import { create } from 'zustand';
import { Item, ItemFilters } from '@/lib/types';

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  filters: ItemFilters;

  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ItemFilters>) => void;
  clearFilters: () => void;

  // Computed functions
  getFilteredItems: () => Item[];
  getItemsStats: () => {
    total: number;
    active: number;
    inactive: number;
    discontinued: number;
    byCategory: Record<string, number>;
    byHazardLevel: Record<string, number>;
    byStorageTemp: Record<string, number>;
    totalWeight: number;
    averageWeight: number;
    averageVolume: number;
  };
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    subcategory: 'all',
    supplierId: 'all',
    hazardLevel: 'all',
    status: 'all',
    search: '',
  },

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
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
        subcategory: 'all',
        supplierId: 'all',
        hazardLevel: 'all',
        status: 'all',
        search: '',
      },
    }),

  getFilteredItems: () => {
    const { items, filters } = get();
    return items.filter((item) => {
      const matchesCategory = !filters.category || filters.category === 'all' || item.category === filters.category;
      const matchesSubcategory = !filters.subcategory || filters.subcategory === 'all' || item.subcategory === filters.subcategory;
      const matchesSupplier = !filters.supplierId || filters.supplierId === 'all' || item.supplierId === filters.supplierId;
      const matchesHazardLevel = !filters.hazardLevel || filters.hazardLevel === 'all' || item.hazardLevel === filters.hazardLevel;
      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      const matchesSearch =
        !filters.search ||
        item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.sku?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase());

      return matchesCategory && matchesSubcategory && matchesSupplier && matchesHazardLevel && matchesStatus && matchesSearch;
    });
  },

  getItemsStats: () => {
    const { items } = get();
    const total = items.length;
    const active = items.filter((item) => item.status === 'ACTIVE').length;
    const inactive = items.filter((item) => item.status === 'INACTIVE').length;
    const discontinued = items.filter((item) => item.status === 'DISCONTINUED').length;

    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byHazardLevel = items.reduce((acc, item) => {
      acc[item.hazardLevel] = (acc[item.hazardLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStorageTemp = items.reduce((acc, item) => {
      acc[item.storageRequirements?.temperature || 'AMBIENT'] = (acc[item.storageRequirements?.temperature || 'AMBIENT'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const averageWeight = total > 0 ? totalWeight / total : 0;

    const totalVolume = items.reduce((sum, item) => {
      const dimensions = item.dimensions || { length: 0, width: 0, height: 0 };
      return sum + (dimensions.length * dimensions.width * dimensions.height);
    }, 0);
    const averageVolume = total > 0 ? totalVolume / total : 0;

    return {
      total,
      active,
      inactive,
      discontinued,
      byCategory,
      byHazardLevel,
      byStorageTemp,
      totalWeight: Math.round(totalWeight * 100) / 100,
      averageWeight: Math.round(averageWeight * 100) / 100,
      averageVolume: Math.round(averageVolume * 100) / 100,
    };
  },
}));
