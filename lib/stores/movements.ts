import { create } from 'zustand';

interface Movement {
  id: string;
  type: 'PUTAWAY' | 'PICKING' | 'TRANSFER' | 'ADJUSTMENT' | 'COUNT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  quantity: number;
  itemId: string;
  fromBinId?: string;
  toBinId?: string;
  userId: string;
  timestamp: Date;
}

interface MovementState {
  movements: Movement[];
  loading: boolean;
  error: string | null;
  filters: {
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
  };

  setMovements: (movements: Movement[]) => void;
  addMovement: (movement: Movement) => void;
  updateMovement: (id: string, updates: Partial<Movement>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<MovementState['filters']>) => void;
  clearFilters: () => void;

  get filteredMovements(): Movement[];
  get movementStats(): {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    failed: number;
  };
}

export const useMovementStore = create<MovementState>((set, get) => ({
  movements: [],
  loading: false,
  error: null,
  filters: {},

  setMovements: (movements) => set({ movements }),
  addMovement: (movement) => set((state) => ({ movements: [...state.movements, movement] })),
  updateMovement: (id, updates) => set((state) => ({
    movements: state.movements.map((m) => m.id === id ? { ...m, ...updates } : m)
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  clearFilters: () => set({ filters: {} }),

  get filteredMovements() {
    const { movements, filters } = get();
    return movements.filter((movement) => {
      const matchesType = !filters.type || movement.type === filters.type;
      const matchesStatus = !filters.status || movement.status === filters.status;
      const matchesPriority = !filters.priority || movement.priority === filters.priority;
      const matchesSearch = !filters.search || 
        movement.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        movement.itemId.toLowerCase().includes(filters.search.toLowerCase());
      return matchesType && matchesStatus && matchesPriority && matchesSearch;
    });
  },

  get movementStats() {
    const { movements } = get();
    return {
      total: movements.length,
      completed: movements.filter(m => m.status === 'COMPLETED').length,
      inProgress: movements.filter(m => m.status === 'IN_PROGRESS').length,
      pending: movements.filter(m => m.status === 'PENDING').length,
      failed: movements.filter(m => m.status === 'FAILED').length,
    };
  },
}));