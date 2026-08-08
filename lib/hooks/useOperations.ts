import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useOperationsStore } from '@/lib/stores/operations';
import { Operation } from '@/lib/types';

// API functions
const fetchOperations = async (): Promise<Operation[]> => {
  return (apiClient as any).operations.getAll() as Promise<Operation[]>;
};

const createOperation = async (operation: Omit<Operation, 'id'>): Promise<Operation> => {
  return (apiClient as any).operations.create(operation) as Promise<Operation>;
};

const updateOperation = async (id: string, updates: Partial<Operation>): Promise<Operation> => {
  return (apiClient as any).operations.update(id, updates) as Promise<Operation>;
};

const deleteOperation = async (id: string): Promise<void> => {
  return (apiClient as any).operations.delete(id) as Promise<void>;
};

export const useOperations = () => {
  const queryClient = useQueryClient();
  const store = useOperationsStore();

  const {
    data: operations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['operations'],
    queryFn: fetchOperations,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (operations) {
      store.setOperations(operations);
    }
  }, [operations]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: createOperation,
    onSuccess: (newOperation) => {
      store.addOperation(newOperation);
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Operation> }) =>
      updateOperation(id, updates),
    onSuccess: (updatedOperation) => {
      store.updateOperation(updatedOperation.id, updatedOperation);
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: (_, deletedId) => {
      store.removeOperation(deletedId);
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });

  const createOperationItem = (operation: Omit<Operation, 'id'>) => {
    store.setLoading(true);
    createMutation.mutate(operation);
  };

  const updateOperationItem = (id: string, updates: Partial<Operation>) => {
    store.setLoading(true);
    updateMutation.mutate({ id, updates });
  };

  const deleteOperationItem = (id: string) => {
    store.setLoading(true);
    deleteMutation.mutate(id);
  };

  const refreshOperations = () => {
    refetch();
  };

  return {
    operations: operations || store.operations,
    filteredOperations: store.filteredOperations,
    operationsStats: store.operationsStats,

    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    createOperation: createOperationItem,
    updateOperation: updateOperationItem,
    deleteOperation: deleteOperationItem,
    refreshOperations,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
