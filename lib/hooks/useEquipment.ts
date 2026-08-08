import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useEquipmentStore } from '@/lib/stores/equipment';
import { Equipment } from '@/lib/types';
import { equipmentToast } from '@/lib/toast';

// API functions (these would typically be in a separate API file)
const fetchEquipment = async (): Promise<Equipment[]> => {
  return (apiClient as any).equipment.getAll() as Promise<Equipment[]>;
};

const createEquipment = async (equipment: Omit<Equipment, 'id'>): Promise<Equipment> => {
  return (apiClient as any).equipment.create(equipment) as Promise<Equipment>;
};

const updateEquipment = async (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
  return (apiClient as any).equipment.update(id, updates) as Promise<Equipment>;
};

const deleteEquipment = async (id: string): Promise<void> => {
  return (apiClient as any).equipment.delete(id) as Promise<void>;
};

// Custom hook
export const useEquipment = () => {
  const queryClient = useQueryClient();
  const store = useEquipmentStore();

  // Query for fetching equipment
  const {
    data: equipment,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['equipment'],
    queryFn: fetchEquipment,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when data changes
  React.useEffect(() => {
    if (equipment) {
      store.setEquipment(equipment);
    }
  }, [equipment]);

  // Update store when error occurs
  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
    }
  }, [error]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createEquipment,
    onSuccess: (newEquipment) => {
      store.addEquipment(newEquipment);
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      equipmentToast.statusChanged(newEquipment.name, 'created');
    },
    onError: (error) => {
      equipmentToast.errorOccurred('New Equipment', error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Equipment> }) =>
      updateEquipment(id, updates),
    onSuccess: (updatedEquipment) => {
      store.updateEquipment(updatedEquipment.id, updatedEquipment);
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      if (updatedEquipment.status === 'maintenance') {
        equipmentToast.maintenanceScheduled(updatedEquipment.name);
      } else {
        equipmentToast.statusChanged(updatedEquipment.name, updatedEquipment.status);
      }
    },
    onError: (error) => {
      equipmentToast.errorOccurred('Equipment Update', error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEquipment,
    onSuccess: (_, deletedId) => {
      store.removeEquipment(deletedId);
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      equipmentToast.statusChanged('Equipment', 'removed');
    },
    onError: (error) => {
      equipmentToast.errorOccurred('Equipment Deletion', error.message);
    },
  });

  // Actions
  const createEquipmentItem = (equipment: Omit<Equipment, 'id'>) => {
    createMutation.mutate(equipment);
  };

  const updateEquipmentItem = (id: string, updates: Partial<Equipment>) => {
    updateMutation.mutate({ id, updates });
  };

  const deleteEquipmentItem = (id: string) => {
    deleteMutation.mutate(id);
  };

  const refreshEquipment = () => {
    refetch();
    equipmentToast.statusChanged('Equipment Data', 'refreshed');
  };

  return {
    // Data
    equipment: equipment || store.equipment,
    filteredEquipment: store.filteredEquipment,
    equipmentStats: store.equipmentStats,

    // State
    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    // Filters
    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    // Actions
    createEquipment: createEquipmentItem,
    updateEquipment: updateEquipmentItem,
    deleteEquipment: deleteEquipmentItem,
    refreshEquipment,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
