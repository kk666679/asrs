import { create } from 'zustand';
import { Maintenance, MaintenanceFilters } from '@/lib/types';

interface MaintenanceState {
  maintenance: Maintenance[];
  loading: boolean;
  error: string | null;
  filters: MaintenanceFilters;

  // Actions
  setMaintenance: (maintenance: Maintenance[]) => void;
  addMaintenance: (maintenance: Maintenance) => void;
  updateMaintenance: (id: string, updates: Partial<Maintenance>) => void;
  removeMaintenance: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<MaintenanceFilters>) => void;
  clearFilters: () => void;

  // Computed
  filteredMaintenance: Maintenance[];
  maintenanceStats: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    overdue: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    averageDuration: number;
    totalCost: number;
  };
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  maintenance: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    priority: 'all',
    status: 'all',
    equipmentId: 'all',
    dateRange: undefined,
  },

  setMaintenance: (maintenance) => set({ maintenance }),

  addMaintenance: (maintenance) =>
    set((state) => ({ maintenance: [...state.maintenance, maintenance] })),

  updateMaintenance: (id, updates) =>
    set((state) => ({
      maintenance: state.maintenance.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
      ),
    })),

  removeMaintenance: (id) =>
    set((state) => ({
      maintenance: state.maintenance.filter((m) => m.id !== id),
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
        priority: 'all',
        status: 'all',
        equipmentId: 'all',
        dateRange: undefined,
      },
    }),

  get filteredMaintenance() {
    const { maintenance, filters } = get();
    return maintenance.filter((m) => {
      const matchesType = filters.type === 'all' || m.type === filters.type;
      const matchesPriority = filters.priority === 'all' || m.priority === filters.priority;
      const matchesStatus = filters.status === 'all' || m.status === filters.status;
      const matchesEquipment = filters.equipmentId === 'all' ||
        m.equipmentId === filters.equipmentId ||
        m.robotId === filters.equipmentId ||
        m.sensorId === filters.equipmentId;

      let matchesDateRange = true;
      if (filters.dateRange) {
        const scheduledDate = new Date(m.scheduledDate);
        matchesDateRange = scheduledDate >= filters.dateRange.start && scheduledDate <= filters.dateRange.end;
      }

      return matchesType && matchesPriority && matchesStatus && matchesEquipment && matchesDateRange;
    });
  },

  get maintenanceStats() {
    const { maintenance } = get();
    const total = maintenance.length;
    const scheduled = maintenance.filter((m) => m.status === 'SCHEDULED').length;
    const inProgress = maintenance.filter((m) => m.status === 'IN_PROGRESS').length;
    const completed = maintenance.filter((m) => m.status === 'COMPLETED').length;
    const overdue = maintenance.filter((m) => {
      const now = new Date();
      const scheduled = new Date(m.scheduledDate);
      return m.status !== 'COMPLETED' && m.status !== 'CANCELLED' && scheduled < now;
    }).length;

    const byPriority = maintenance.reduce((acc, m) => {
      acc[m.priority] = (acc[m.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = maintenance.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedMaintenance = maintenance.filter(m => m.status === 'COMPLETED' && m.actualDuration);
    const averageDuration = completedMaintenance.length > 0
      ? completedMaintenance.reduce((sum, m) => sum + (m.actualDuration || 0), 0) / completedMaintenance.length
      : 0;

    const totalCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);

    return {
      total,
      scheduled,
      inProgress,
      completed,
      overdue,
      byPriority,
      byType,
      averageDuration: Math.round(averageDuration * 100) / 100,
      totalCost,
    };
  },
}));
