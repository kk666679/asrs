import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAlertStore } from '@/lib/stores/alerts';
import { Alert } from '@/lib/types';

// API functions
const fetchAlerts = async (): Promise<Alert[]> => {
  return apiClient.alerts.getAll() as Promise<Alert[]>;
};

const createAlert = async (alert: Omit<Alert, 'id'>): Promise<Alert> => {
  return apiClient.alerts.create(alert) as Promise<Alert>;
};

const updateAlert = async (id: string, updates: Partial<Alert>): Promise<Alert> => {
  return (apiClient.alerts as any).update(id, updates) as Promise<Alert>;
};

const acknowledgeAlert = async (id: string): Promise<Alert> => {
  const response = await fetch(`/api/alerts/${id}/acknowledge`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to acknowledge alert');
  }
  return response.json();
};

const resolveAlert = async (id: string): Promise<Alert> => {
  const response = await fetch(`/api/alerts/${id}/resolve`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to resolve alert');
  }
  return response.json();
};

export const useAlerts = () => {
  const queryClient = useQueryClient();
  const store = useAlertStore();

  const {
    data: alerts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    staleTime: 30 * 1000, // 30 seconds for alerts (more frequent updates)
  });

  React.useEffect(() => {
    if (alerts) {
      store.setAlerts(alerts);
      store.setLoading(false);
      store.setError(null);
    }
  }, [alerts, store]);

  React.useEffect(() => {
    if (error) {
      store.setError(error.message);
      store.setLoading(false);
    }
  }, [error, store]);

  const createMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: (newAlert) => {
      store.addAlert(newAlert);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Alert> }) =>
      updateAlert(id, updates),
    onSuccess: (updatedAlert) => {
      store.updateAlert(updatedAlert.id, updatedAlert);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: (acknowledgedAlert) => {
      store.acknowledgeAlert(acknowledgedAlert.id);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: resolveAlert,
    onSuccess: (resolvedAlert) => {
      store.resolveAlert(resolvedAlert.id);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const createAlertItem = (alert: Omit<Alert, 'id'>) => {
    store.setLoading(true);
    createMutation.mutate(alert);
  };

  const updateAlertItem = (id: string, updates: Partial<Alert>) => {
    store.setLoading(true);
    updateMutation.mutate({ id, updates });
  };

  const acknowledgeAlertItem = (id: string) => {
    acknowledgeMutation.mutate(id);
  };

  const resolveAlertItem = (id: string) => {
    resolveMutation.mutate(id);
  };

  const refreshAlerts = () => {
    refetch();
  };

  return {
    alerts: alerts || store.alerts,
    filteredAlerts: store.filteredAlerts,
    alertStats: store.alertStats,

    isLoading: isLoading || store.loading,
    error: error?.message || store.error,

    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,

    createAlert: createAlertItem,
    updateAlert: updateAlertItem,
    acknowledgeAlert: acknowledgeAlertItem,
    resolveAlert: resolveAlertItem,
    refreshAlerts,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isAcknowledging: acknowledgeMutation.isPending,
    isResolving: resolveMutation.isPending,
  };
};
