import { create } from 'zustand';
import { Robot } from '@/lib/types';

interface RobotState {
  robots: Robot[];
  loading: boolean;
  error: string | null;
  filters: {
    type: string;
    status: string;
    zoneId: string;
    search: string;
  };

  // Actions
  setRobots: (robots: Robot[]) => void;
  addRobot: (robot: Robot) => void;
  updateRobot: (id: string, updates: Partial<Robot>) => void;
  removeRobot: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<RobotState['filters']>) => void;
  clearFilters: () => void;

  // Computed functions
  getFilteredRobots: () => Robot[];
  getRobotStats: () => {
    total: number;
    active: number;
    idle: number;
    maintenance: number;
    error: number;
    averageBattery: number;
  };
}

export const useRobotStore = create<RobotState>((set, get) => ({
  robots: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    zoneId: 'all',
    search: '',
  },

  setRobots: (robots) => set({ robots }),

  addRobot: (robot) =>
    set((state) => ({ robots: [...state.robots, robot] })),

  updateRobot: (id, updates) =>
    set((state) => ({
      robots: state.robots.map((robot) =>
        robot.id === id ? { ...robot, ...updates } : robot
      ),
    })),

  removeRobot: (id) =>
    set((state) => ({
      robots: state.robots.filter((robot) => robot.id !== id),
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
        zoneId: 'all',
        search: '',
      },
    }),

  getFilteredRobots: () => {
    const { robots, filters } = get();
    return robots.filter((robot) => {
      const matchesType = !filters.type || filters.type === 'all' || robot.type === filters.type;
      const matchesStatus = !filters.status || filters.status === 'all' || robot.status === filters.status;
      const matchesZone = !filters.zoneId || filters.zoneId === 'all' || robot.zoneId === filters.zoneId;
      const matchesSearch =
        !filters.search ||
        robot.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        robot.code?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (robot.location && robot.location.toLowerCase().includes(filters.search.toLowerCase()));

      return matchesType && matchesStatus && matchesZone && matchesSearch;
    });
  },

  getRobotStats: () => {
    const { robots } = get();
    const total = robots.length;
    const active = robots.filter((robot) => robot.status === 'WORKING').length;
    const idle = robots.filter((robot) => robot.status === 'IDLE').length;
    const maintenance = robots.filter((robot) => robot.status === 'MAINTENANCE').length;
    const error = robots.filter((robot) => robot.status === 'ERROR').length;
    const averageBattery = robots.length > 0
      ? Math.round(robots.filter(r => r.batteryLevel !== undefined).reduce((sum, r) => sum + (r.batteryLevel || 0), 0) /
          robots.filter(r => r.batteryLevel !== undefined).length)
      : 0;

    return {
      total,
      active,
      idle,
      maintenance,
      error,
      averageBattery,
    };
  },
}));
