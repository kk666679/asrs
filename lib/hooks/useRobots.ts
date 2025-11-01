import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRobotStore } from '@/lib/stores/robots';
import { Robot } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

// API functions using the new NestJS backend
const fetchRobots = async (): Promise<Robot[]> => {
  return (apiClient as any).robots.getAll() as Promise<Robot[]>;
};

const createRobot = async (robot: Omit<Robot, 'id'>): Promise<Robot> => {
  return (apiClient as any).robots.create(robot) as Promise<Robot>;
};

const updateRobot = async (id: string, updates: Partial<Robot>): Promise<Robot> => {
  return (apiClient as any).robots.update(id, updates) as Promise<Robot>;
};

const deleteRobot = async (id: string): Promise<void> => {
  return (apiClient as any).robots.delete(id) as Promise<void>;
};

export const useRobots = () => {
  const queryClient = useQueryClient();
  const store = useRobotStore();

  const {
    data: robots,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['robots'],
    queryFn: fetchRobots,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (robots) {
      store.setRobots(robots);
      store.setLoading(false);
      store.setError(null);
    }
  }, [robots]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
      store.setLoading(false);
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: createRobot,
    onSuccess: (newRobot) => {
      store.addRobot(newRobot);
      queryClient.invalidateQueries({ queryKey: ['robots'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Robot> }) =>
      updateRobot(id, updates),
    onSuccess: (updatedRobot) => {
      store.updateRobot(updatedRobot.id, updatedRobot);
      queryClient.invalidateQueries({ queryKey: ['robots'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRobot,
    onSuccess: (_, deletedId) => {
      store.removeRobot(deletedId);
      queryClient.invalidateQueries({ queryKey: ['robots'] });
    },
  });

  const createRobotItem = (robot: Omit<Robot, 'id'>) => {
    store.setLoading(true);
    createMutation.mutate(robot);
  };

  const updateRobotItem = (id: string, updates: Partial<Robot>) => {
    store.setLoading(true);
    updateMutation.mutate({ id, updates });
  };

  const deleteRobotItem = (id: string) => {
    store.setLoading(true);
    deleteMutation.mutate(id);
  };

  const refreshRobots = () => {
    refetch();
  };

  return {
    robots: robots || store.robots,
    filteredRobots: store.getFilteredRobots(),
    robotStats: store.getRobotStats(),

    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    createRobot: createRobotItem,
    updateRobot: updateRobotItem,
    deleteRobot: deleteRobotItem,
    refreshRobots,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
