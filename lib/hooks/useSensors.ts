import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useSensorStore } from '@/lib/stores/sensors';
import { Sensor } from '@/lib/types';

// API functions
const fetchSensors = async (): Promise<Sensor[]> => {
  return (apiClient as any).sensors.getAll() as Promise<Sensor[]>;
};

const createSensor = async (sensor: Omit<Sensor, 'id'>): Promise<Sensor> => {
  return (apiClient as any).sensors.create(sensor) as Promise<Sensor>;
};

const updateSensor = async (id: string, updates: Partial<Sensor>): Promise<Sensor> => {
  return (apiClient as any).sensors.update(id, updates) as Promise<Sensor>;
};

const deleteSensor = async (id: string): Promise<void> => {
  return (apiClient as any).sensors.delete(id) as Promise<void>;
};

export const useSensors = () => {
  const queryClient = useQueryClient();
  const store = useSensorStore();

  const {
    data: sensors,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sensors'],
    queryFn: fetchSensors,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (sensors) {
      store.setSensors(sensors);
    }
  }, [sensors]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: createSensor,
    onSuccess: (newSensor) => {
      store.addSensor(newSensor);
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Sensor> }) =>
      updateSensor(id, updates),
    onSuccess: (updatedSensor) => {
      store.updateSensor(updatedSensor.id, updatedSensor);
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSensor,
    onSuccess: (_, deletedId) => {
      store.removeSensor(deletedId);
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
    },
  });

  const createSensorItem = (sensor: Omit<Sensor, 'id'>) => {
    store.setLoading(true);
    createMutation.mutate(sensor);
  };

  const updateSensorItem = (id: string, updates: Partial<Sensor>) => {
    store.setLoading(true);
    updateMutation.mutate({ id, updates });
  };

  const deleteSensorItem = (id: string) => {
    store.setLoading(true);
    deleteMutation.mutate(id);
  };

  const refreshSensors = () => {
    refetch();
  };

  return {
    sensors: sensors || store.sensors,
    filteredSensors: store.filteredSensors,
    sensorStats: store.sensorStats,

    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    createSensor: createSensorItem,
    updateSensor: updateSensorItem,
    deleteSensor: deleteSensorItem,
    refreshSensors,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
