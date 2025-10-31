import { create } from 'zustand';
import { Alert } from '@/lib/types';

interface AlertsState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  filters: {
    type: string;
    status: string;
    priority: string;
    acknowledged: boolean | null;
  };
  realTimeEnabled: boolean;

  // Actions
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  acknowledgeAlert: (id: string, acknowledgedBy: string, notes?: string) => void;
  removeAlert: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<AlertsState['filters']>) => void;
  clearFilters: () => void;
  setRealTimeEnabled: (enabled: boolean) => void;

  // Computed
  filteredAlerts: Alert[];
  alertStats: {
    total: number;
    unacknowledged: number;
    critical: number;
    warnings: number;
    info: number;
  };
  recentAlerts: Alert[];
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    priority: 'all',
    acknowledged: null,
  },
  realTimeEnabled: true,

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts] })),

  updateAlert: (id, updates) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, ...updates } : alert
      ),
    })),

  acknowledgeAlert: (id, acknowledgedBy, notes) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedBy,
              acknowledgedAt: new Date().toISOString(),
              ...notes && { notes },
            }
          : alert
      ),
    })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () =>
    set({
      filters: {
        type: 'all',
        status: 'all',
        priority: 'all',
        acknowledged: null,
      },
    }),

  setRealTimeEnabled: (enabled) => set({ realTimeEnabled: enabled }),

  get filteredAlerts() {
    const { alerts, filters } = get();
    return alerts.filter((alert) => {
      const matchesType = filters.type === 'all' || alert.type === filters.type;
      const matchesPriority = filters.priority === 'all' || alert.priority === filters.priority;
      const matchesAcknowledged =
        filters.acknowledged === null || alert.acknowledged === filters.acknowledged;

      return matchesType && matchesPriority && matchesAcknowledged;
    });
  },

  get alertStats() {
    const { alerts } = get();
    return {
      total: alerts.length,
      unacknowledged: alerts.filter((a) => !a.acknowledged).length,
      critical: alerts.filter((a) => a.type === 'critical').length,
      warnings: alerts.filter((a) => a.type === 'warning').length,
      info: alerts.filter((a) => a.type === 'info').length,
    };
  },

  get recentAlerts() {
    const { alerts } = get();
    return alerts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  },
}));
