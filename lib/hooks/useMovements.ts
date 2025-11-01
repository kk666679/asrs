import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useMovementStore } from '@/lib/stores/movements';

const fetchMovements = async () => {
  return (apiClient as any).movements.getAll() as Promise<any[]>;
};

const createMovement = async (movement: any) => {
  return (apiClient as any).movements.create(movement) as Promise<any>;
};

export const useMovements = () => {
  const queryClient = useQueryClient();
  const store = useMovementStore();

  const { data: movements, isLoading, error, refetch } = useQuery({
    queryKey: ['movements'],
    queryFn: fetchMovements,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (movements) {
      store.setMovements(movements);
      store.setLoading(false);
      store.setError(null);
    }
  }, [movements, store]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
      store.setLoading(false);
    }
  }, [error, store]);

  const createMutation = useMutation({
    mutationFn: createMovement,
    onSuccess: (newMovement) => {
      store.addMovement(newMovement);
      queryClient.invalidateQueries({ queryKey: ['movements'] });
    },
  });

  return {
    movements: movements || store.movements,
    filteredMovements: store.filteredMovements,
    movementStats: store.movementStats,
    isLoading: isLoading || store.loading,
    error: error?.message || store.error,
    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    createMovement: createMutation.mutate,
    refreshMovements: refetch,
    isCreating: createMutation.isPending,
  };
};