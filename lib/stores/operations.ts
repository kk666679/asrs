import { create } from 'zustand';
import { Operation, OperationFilters } from '@/lib/types';

interface OperationsState {
  operations: Operation[];
  loading: boolean;
  error: string | null;
  filters: OperationFilters;

  // Actions
  setOperations: (operations: Operation[]) => void;
  addOperation: (operation: Operation) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  removeOperation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<OperationFilters>) => void;
  clearFilters: () => void;

  // Computed
  filteredOperations: Operation[];
  operationsStats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    averageDuration: number;
    onTimePercentage: number;
  };
}

export const useOperationsStore = create<OperationsState>((set, get) => ({
  operations: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    priority: 'all',
    assignedRobotId: 'all',
    assignedUserId: 'all',
    dateRange: undefined,
  },

  setOperations: (operations) => set({ operations }),

  addOperation: (operation) =>
    set((state) => ({ operations: [...state.operations, operation] })),

  updateOperation: (id, updates) =>
    set((state) => ({
      operations: state.operations.map((op) =>
        op.id === id ? { ...op, ...updates, updatedAt: new Date() } : op
      ),
    })),

  removeOperation: (id) =>
    set((state) => ({
      operations: state.operations.filter((op) => op.id !== id),
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
        assignedRobotId: 'all',
        assignedUserId: 'all',
        dateRange: undefined,
      },
    }),

  get filteredOperations() {
    const { operations, filters } = get();
    return operations.filter((op) => {
      const matchesType = filters.type === 'all' || op.type === filters.type;
      const matchesStatus = filters.status === 'all' || op.status === filters.status;
      const matchesPriority = filters.priority === 'all' || op.priority === filters.priority;
      const matchesRobot = filters.assignedRobotId === 'all' || op.assignedRobotId === filters.assignedRobotId;
      const matchesUser = filters.assignedUserId === 'all' || op.assignedUserId === filters.assignedUserId;

      let matchesDateRange = true;
      if (filters.dateRange) {
        const createdDate = new Date(op.createdAt);
        matchesDateRange = createdDate >= filters.dateRange.start && createdDate <= filters.dateRange.end;
      }

      return matchesType && matchesStatus && matchesPriority && matchesRobot && matchesUser && matchesDateRange;
    });
  },

  get operationsStats() {
    const { operations } = get();
    const total = operations.length;
    const pending = operations.filter((op) => op.status === 'PENDING').length;
    const inProgress = operations.filter((op) => op.status === 'IN_PROGRESS').length;
    const completed = operations.filter((op) => op.status === 'COMPLETED').length;
    const failed = operations.filter((op) => op.status === 'FAILED' || op.status === 'CANCELLED').length;

    const byType = operations.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = operations.reduce((acc, op) => {
      acc[op.priority] = (acc[op.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedOps = operations.filter(op => op.status === 'COMPLETED' && op.actualDuration);
    const averageDuration = completedOps.length > 0
      ? completedOps.reduce((sum, op) => sum + (op.actualDuration || 0), 0) / completedOps.length
      : 0;

    const onTimeOps = completedOps.filter(op => {
      const estimated = op.estimatedDuration;
      const actual = op.actualDuration || 0;
      return actual <= estimated * 1.1; // 10% tolerance
    });
    const onTimePercentage = completedOps.length > 0 ? (onTimeOps.length / completedOps.length) * 100 : 0;

    return {
      total,
      pending,
      inProgress,
      completed,
      failed,
      byType,
      byPriority,
      averageDuration: Math.round(averageDuration * 100) / 100,
      onTimePercentage: Math.round(onTimePercentage * 100) / 100,
    };
  },
}));
