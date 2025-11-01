import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useShipmentsStore } from '@/lib/stores/shipments';
import { Shipment } from '@/lib/types';

// API functions
const fetchShipments = async (): Promise<Shipment[]> => {
  return apiClient.shipments.getAll();
};

const createShipment = async (shipment: Omit<Shipment, 'id'>): Promise<Shipment> => {
  return apiClient.shipments.create(shipment);
};

const updateShipment = async (id: string, updates: Partial<Shipment>): Promise<Shipment> => {
  return apiClient.shipments.update(id, updates);
};

const deleteShipment = async (id: string): Promise<void> => {
  return apiClient.shipments.delete(id);
};

export const useShipments = () => {
  const queryClient = useQueryClient();
  const store = useShipmentsStore();

  const {
    data: shipments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (shipments) {
      store.setShipments(shipments);
      store.setLoading(false);
      store.setError(null);
    }
  }, [shipments, store]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
      store.setLoading(false);
    }
  }, [error, store]);

  const createMutation = useMutation({
    mutationFn: createShipment,
    onSuccess: (newShipment) => {
      store.addShipment(newShipment);
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Shipment> }) =>
      updateShipment(id, updates),
    onSuccess: (updatedShipment) => {
      store.updateShipment(updatedShipment.id, updatedShipment);
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShipment,
    onSuccess: (_, deletedId) => {
      store.removeShipment(deletedId);
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });

  const createShipmentItem = (shipment: Omit<Shipment, 'id'>) => {
    store.setLoading(true);
    createMutation.mutate(shipment);
  };

  const updateShipmentItem = (id: string, updates: Partial<Shipment>) => {
    store.setLoading(true);
    updateMutation.mutate({ id, updates });
  };

  const deleteShipmentItem = (id: string) => {
    store.setLoading(true);
    deleteMutation.mutate(id);
  };

  const refreshShipments = () => {
    refetch();
  };

  return {
    shipments: shipments || store.shipments,
    filteredShipments: store.filteredShipments,
    shipmentsStats: store.shipmentsStats,

    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    createShipment: createShipmentItem,
    updateShipment: updateShipmentItem,
    deleteShipment: deleteShipmentItem,
    refreshShipments,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
