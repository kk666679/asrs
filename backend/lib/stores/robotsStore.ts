import { create } from 'zustand';
import { Robot, RobotCommand } from '@/lib/types';

interface RobotsState {
  robots: Robot[];
  commands: RobotCommand[];
  loading: boolean;
  error: string | null;
  filters: {
    type: string;
    status: string;
    zoneId: string;
    search: string;
  };
  selectedRobot: Robot | null;

  // Actions
  setRobots: (robots: Robot[]) => void;
  addRobot: (robot: Robot) => void;
  updateRobot: (id: string, updates: Partial<Robot>) => void;
  removeRobot: (id: string) => void;
  setCommands: (commands: RobotCommand[]) => void;
  addCommand: (command: RobotCommand) => void;
  updateCommand: (id: string, updates: Partial<RobotCommand>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<RobotsState['filters']>) => void;
  clearFilters: () => void;
  setSelectedRobot: (robot: Robot | null) => void;

  // Computed
  filteredRobots: Robot[];
  robotStats: {
    total: number;
    idle: number;
    working: number;
    maintenance: number;
    error: number;
    offline: number;
  };
  pendingCommands: RobotCommand[];
  activeCommands: RobotCommand[];
}

export const useRobotsStore = create<RobotsState>((set, get) => ({
  robots: [],
  commands: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    zoneId: 'all',
    search: '',
  },
  selectedRobot: null,

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

  setCommands: (commands) => set({ commands }),

  addCommand: (command) =>
    set((state) => ({ commands: [command, ...state.commands] })),

  updateCommand: (id, updates) =>
    set((state) => ({
      commands: state.commands.map((cmd) =>
        cmd.id === id ? { ...cmd, ...updates } : cmd
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
        status: 'all',
        zoneId: 'all',
        search: '',
      },
    }),

  setSelectedRobot: (robot) => set({ selectedRobot: robot }),

  get filteredRobots() {
    const { robots, filters } = get();
    return robots.filter((robot) => {
      const matchesType = filters.type === 'all' || robot.type === filters.type;
      const matchesStatus = filters.status === 'all' || robot.status === filters.status;
      const matchesZone = filters.zoneId === 'all' || robot.zone?.id === filters.zoneId;
      const matchesSearch =
        !filters.search ||
        robot.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        robot.code.toLowerCase().includes(filters.search.toLowerCase());

      return matchesType && matchesStatus && matchesZone && matchesSearch;
    });
  },

  get robotStats() {
    const { robots } = get();
    return {
      total: robots.length,
      idle: robots.filter((r) => r.status === 'IDLE').length,
      working: robots.filter((r) => r.status === 'WORKING').length,
      maintenance: robots.filter((r) => r.status === 'MAINTENANCE').length,
      error: robots.filter((r) => r.status === 'ERROR').length,
      offline: robots.filter((r) => r.status === 'OFFLINE').length,
    };
  },

  get pendingCommands() {
    const { commands } = get();
    return commands.filter((cmd) => cmd.status === 'PENDING');
  },

  get activeCommands() {
    const { commands } = get();
    return commands.filter((cmd) => ['EXECUTING'].includes(cmd.status));
  },
}));
