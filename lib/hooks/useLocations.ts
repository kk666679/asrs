import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useLocationsStore } from '@/lib/stores/locations';
import { Location } from '@/lib/types';

// API functions
const fetchLocations = async (): Promise<Location[]> => {
  return (apiClient as any).locations.getAll() as Promise<Location[]>;
};

const createLocation = async (location: Omit<Location, 'id'>): Promise<Location> => {
  return (apiClient as any).locations.create(location) as Promise<Location>;
};

const updateLocation = async (id: string, updates: Partial<Location>): Promise<Location> => {
  return (apiClient as any).locations.update(id, updates) as Promise<Location>;
};

const deleteLocation = async (id: string): Promise<void> => {
  return (apiClient as any).locations.delete(id) as Promise<void>;
};

export const useLocations = () => {
  const queryClient = useQueryClient();
  const store = useLocationsStore();

  const {
    data: locations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (locations) {
      store.setLocations(locations);
      store.setLoading(false);
      store.setError(null);
    }
  }, [locations, store]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
      store.setLoading(false);
    }
  }, [error, store]);

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: (newLocation) => {
      store.addLocation(newLocation);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Location> }) =>
      updateLocation(id, updates),
    onSuccess: (updatedLocation) => {
      store.updateLocation(updatedLocation.id, updatedLocation);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: (_, deletedId) => {
      store.removeLocation(deletedId);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  const createLocationItem = (location: Omit<Location, 'id'>) => {
    store.setLoading(true);
    createMutation.mutate(location);
  };

  const updateLocationItem = (id: string, updates: Partial<Location>) => {
    store.setLoading(true);
    updateMutation.mutate({ id, updates });
  };

  const deleteLocationItem = (id: string) => {
    store.setLoading(true);
    deleteMutation.mutate(id);
  };

  const refreshLocations = () => {
    refetch();
  };

  return {
    locations: locations || store.locations,
    filteredLocations: store.filteredLocations,
    locationsStats: store.locationsStats,

    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    createLocation: createLocationItem,
    updateLocation: updateLocationItem,
    deleteLocation: deleteLocationItem,
    refreshLocations,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
