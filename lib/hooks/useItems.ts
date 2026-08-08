import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useItemsStore } from '@/lib/stores/items';
import { Item } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

// API functions using the new NestJS backend
const fetchItems = async (): Promise<Item[]> => {
  return (apiClient as any).items.getAll() as Promise<Item[]>;
};

const createItem = async (item: Omit<Item, 'id'>): Promise<Item> => {
  return (apiClient as any).items.create(item) as Promise<Item>;
};

const updateItem = async (id: string, updates: Partial<Item>): Promise<Item> => {
  return (apiClient as any).items.update(id, updates) as Promise<Item>;
};

const deleteItem = async (id: string): Promise<void> => {
  return (apiClient as any).items.delete(id) as Promise<void>;
};

export const useItems = () => {
  const queryClient = useQueryClient();
  const store = useItemsStore();

  const {
    data: items,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
    staleTime: 5 * 60 * 1000,
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
    mutationFn: createItem,
    onSuccess: (newItem) => {
      store.addItem(newItem);
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Item> }) =>
      updateItem(id, updates),
    onSuccess: (updatedItem) => {
      store.updateItem(updatedItem.id, updatedItem);
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: (_, deletedId) => {
      store.removeItem(deletedId);
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const createItemEntry = (item: Omit<Item, 'id'>) => {
    store.setLoading(true);
    createMutation.mutate(item);
  };

  const updateItemEntry = (id: string, updates: Partial<Item>) => {
    store.setLoading(true);
    updateMutation.mutate({ id, updates });
  };

  const deleteItemEntry = (id: string) => {
    store.setLoading(true);
    deleteMutation.mutate(id);
  };

  const refreshItems = () => {
    refetch();
  };

  return {
    items: items || store.items,
    filteredItems: store.getFilteredItems(),
    itemsStats: store.getItemsStats(),

    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    createItem: createItemEntry,
    updateItem: updateItemEntry,
    deleteItem: deleteItemEntry,
    refreshItems,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
