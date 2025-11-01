import { create } from 'zustand';
import { MaintenanceTask } from '@/lib/types';

interface MaintenanceState {
  tasks: MaintenanceTask[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    type: string;
    priority: string;
    technician: string;
    zone: string;
  };
  selectedTask: MaintenanceTask | null;

  // Actions
  setTasks: (tasks: MaintenanceTask[]) => void;
  addTask: (task: MaintenanceTask) => void;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => void;
  removeTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<MaintenanceState['filters']>) => void;
  clearFilters: () => void;
  setSelectedTask: (task: MaintenanceTask | null) => void;

  // Computed
  filteredTasks: MaintenanceTask[];
  taskStats: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    overdue: number;
    cancelled: number;
  };
  overdueTasks: MaintenanceTask[];
  upcomingTasks: MaintenanceTask[];
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    type: 'all',
    priority: 'all',
    technician: 'all',
    zone: 'all',
  },
  selectedTask: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
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
        status: 'all',
        type: 'all',
        priority: 'all',
        technician: 'all',
        zone: 'all',
      },
    }),

  setSelectedTask: (task) => set({ selectedTask: task }),

  get filteredTasks() {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesType = filters.type === 'all' || task.type === filters.type;
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesTechnician = filters.technician === 'all' || task.technician === filters.technician;
      const matchesZone = filters.zone === 'all' || task.zone === filters.zone;

      return matchesStatus && matchesType && matchesPriority && matchesTechnician && matchesZone;
    });
  },

  get taskStats() {
    const { tasks } = get();
    return {
      total: tasks.length,
      scheduled: tasks.filter((t) => t.status === 'scheduled').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter((t) => t.status === 'overdue').length,
      cancelled: tasks.filter((t) => t.status === 'cancelled').length,
    };
  },

  get overdueTasks() {
    const { tasks } = get();
    const now = new Date();
    return tasks.filter((task) =>
      task.status !== 'completed' &&
      task.status !== 'cancelled' &&
      new Date(task.scheduledDate) < now
    );
  },

  get upcomingTasks() {
    const { tasks } = get();
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks
      .filter((task) =>
        task.status === 'scheduled' &&
        new Date(task.scheduledDate) >= now &&
        new Date(task.scheduledDate) <= nextWeek
      )
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  },
}));
