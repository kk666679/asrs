import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useMaintenanceStore } from '@/lib/stores/maintenance';
import { Maintenance } from '@/lib/types';

// API functions
const fetchMaintenance = async (): Promise<Maintenance[]> => {
  return (apiClient as any).maintenance.getAll() as Promise<Maintenance[]>;
};

const createMaintenance = async (maintenance: Omit<Maintenance, 'id'>): Promise<Maintenance> => {
  return (apiClient as any).maintenance.create(maintenance) as Promise<Maintenance>;
};

const updateMaintenance = async (id: string, updates: Partial<Maintenance>): Promise<Maintenance> => {
  return (apiClient as any).maintenance.update(id, updates) as Promise<Maintenance>;
};

const deleteMaintenance = async (id: string): Promise<void> => {
  return (apiClient as any).maintenance.delete(id) as Promise<void>;
};

export const useMaintenance = () => {
  const queryClient = useQueryClient();
  const store = useMaintenanceStore();

  const {
    data: maintenance,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchMaintenance,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (maintenance) {
      store.setMaintenance(maintenance);
      store.setLoading(false);
      store.setError(null);
    }
  }, [maintenance, store]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
      store.setLoading(false);
    }
  }, [error, store]);

  const createMutation = useMutation({
    mutationFn: createMaintenance,
    onSuccess: (newMaintenance) => {
      store.addMaintenance(newMaintenance);
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Maintenance> }) =>
      updateMaintenance(id, updates),
    onSuccess: (updatedMaintenance) => {
      store.updateMaintenance(updatedMaintenance.id, updatedMaintenance);
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: (_, deletedId) => {
      store.removeMaintenance(deletedId);
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const createMaintenanceItem = (maintenance: Omit<Maintenance, 'id'>) => {
    store.setLoading(true);
    createMutation.mutate(maintenance);
  };

  const updateMaintenanceItem = (id: string, updates: Partial<Maintenance>) => {
    store.setLoading(true);
    updateMutation.mutate({ id, updates });
  };

  const deleteMaintenanceItem = (id: string) => {
    store.setLoading(true);
    deleteMutation.mutate(id);
  };

  const refreshMaintenance = () => {
    refetch();
  };

  return {
    maintenance: maintenance || store.maintenance,
    filteredMaintenance: store.filteredMaintenance,
    maintenanceStats: store.maintenanceStats,

    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    createMaintenance: createMaintenanceItem,
    updateMaintenance: updateMaintenanceItem,
    deleteMaintenance: deleteMaintenanceItem,
    refreshMaintenance,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
