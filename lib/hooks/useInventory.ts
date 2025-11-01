import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInventoryStore } from '@/lib/stores/inventory';
import { InventoryItem } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

// API functions using the new NestJS backend
const fetchInventory = async (): Promise<InventoryItem[]> => {
  return (apiClient as any).inventory.getAll() as Promise<InventoryItem[]>;
};

const createInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  return (apiClient as any).inventory.create(item) as Promise<InventoryItem>;
};

const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> => {
  return (apiClient as any).inventory.update(id, updates) as Promise<InventoryItem>;
};

const deleteInventoryItem = async (id: string): Promise<void> => {
  return (apiClient as any).inventory.delete(id) as Promise<void>;
};

const updateQuantity = async (id: string, quantity: number): Promise<InventoryItem> => {
  return (apiClient as any).inventory.update(id, { quantity }) as Promise<InventoryItem>;
};

export const useInventory = () => {
  const queryClient = useQueryClient();
  const store = useInventoryStore();

  const {
    data: items,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  React.useEffect(() => {
    if (items) {
      store.setItems(items);
      store.setLoading(false);
      store.setError(null);
    }
  }, [items]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
      store.setLoading(false);
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: (newItem) => {
      store.addItem(newItem);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) =>
      updateInventoryItem(id, updates),
    onSuccess: (updatedItem) => {
      store.updateItem(updatedItem.id, updatedItem);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: (_, deletedId) => {
      store.removeItem(deletedId);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const quantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      updateQuantity(id, quantity),
    onSuccess: (updatedItem) => {
      store.updateQuantity(updatedItem.id, updatedItem.quantity);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const createItem = (item: Omit<InventoryItem, 'id'>) => {
    store.setLoading(true);
    createMutation.mutate(item);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    store.setLoading(true);
    updateMutation.mutate({ id, updates });
  };

  const deleteItem = (id: string) => {
    store.setLoading(true);
    deleteMutation.mutate(id);
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    quantityMutation.mutate({ id, quantity });
  };

  const refreshInventory = () => {
    refetch();
  };

  return {
    items: items || store.items,
    filteredItems: store.getFilteredItems(),
    inventoryStats: store.getInventoryStats(),

    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    createItem,
    updateItem,
    deleteItem,
    updateQuantity: updateItemQuantity,
    refreshInventory,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdatingQuantity: quantityMutation.isPending,
  };
};
