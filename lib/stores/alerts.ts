import { create } from 'zustand';
import { Alert, AlertFilters } from '@/lib/types';

interface AlertState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  filters: AlertFilters;

  // Actions
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<AlertFilters>) => void;
  clearFilters: () => void;

  // Computed
  filteredAlerts: Alert[];
  alertStats: {
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    critical: number;
    warning: number;
    info: number;
    byType: Record<string, number>;
  };
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    severity: 'all',
    acknowledged: undefined,
    dateRange: undefined,
  },

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) =>
    set((state) => ({ alerts: [...state.alerts, alert] })),

  updateAlert: (id, updates) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, ...updates } : alert
      ),
    })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),

  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      ),
    })),

  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, resolvedAt: new Date() } : alert
      ),
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
        severity: 'all',
        acknowledged: undefined,
        dateRange: undefined,
      },
    }),

  get filteredAlerts() {
    const { alerts, filters } = get();
    return alerts.filter((alert) => {
      const matchesType = filters.type === 'all' || alert.type === filters.type;
      const matchesSeverity = filters.severity === 'all' || alert.severity === filters.severity;
      const matchesAcknowledged = filters.acknowledged === undefined || alert.acknowledged === filters.acknowledged;

      let matchesDateRange = true;
      if (filters.dateRange) {
        const alertDate = new Date(alert.createdAt);
        matchesDateRange = alertDate >= filters.dateRange.start && alertDate <= filters.dateRange.end;
      }

      return matchesType && matchesSeverity && matchesAcknowledged && matchesDateRange;
    });
  },

  get alertStats() {
    const { alerts } = get();
    const total = alerts.length;
    const active = alerts.filter((alert) => !alert.resolvedAt).length;
    const acknowledged = alerts.filter((alert) => alert.acknowledged).length;
    const resolved = alerts.filter((alert) => alert.resolvedAt).length;
    const critical = alerts.filter((alert) => alert.severity === 'CRITICAL').length;
    const warning = alerts.filter((alert) => alert.severity === 'WARNING').length;
    const info = alerts.filter((alert) => alert.severity === 'INFO').length;

    const byType = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      acknowledged,
      resolved,
      critical,
      warning,
      info,
      byType,
    };
  },
}));
