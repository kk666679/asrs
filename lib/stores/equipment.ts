import { create } from 'zustand';
import { Equipment, EquipmentFilters } from '@/lib/types';

interface EquipmentState {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  filters: EquipmentFilters;

  // Actions
  setEquipment: (equipment: Equipment[]) => void;
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<EquipmentFilters>) => void;
  clearFilters: () => void;

  // Computed
  filteredEquipment: Equipment[];
  equipmentStats: {
    total: number;
    online: number;
    offline: number;
    maintenance: number;
    charging: number;
    averageEfficiency: number;
    averageBattery: number;
  };
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    search: '',
  },

  setEquipment: (equipment) => set({ equipment }),

  addEquipment: (equipment) =>
    set((state) => ({ equipment: [...state.equipment, equipment] })),

  updateEquipment: (id, updates) =>
    set((state) => ({
      equipment: state.equipment.map((eq) =>
        eq.id === id ? { ...eq, ...updates } : eq
      ),
    })),

  removeEquipment: (id) =>
    set((state) => ({
      equipment: state.equipment.filter((eq) => eq.id !== id),
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
        search: '',
      },
    }),

  get filteredEquipment() {
    const { equipment, filters } = get();
    return equipment.filter((eq) => {
      const matchesType = filters.type === 'all' || eq.type === filters.type;
      const matchesStatus = filters.status === 'all' || eq.status === filters.status;
      const matchesSearch =
        !filters.search ||
        eq.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        eq.model.toLowerCase().includes(filters.search.toLowerCase()) ||
        eq.location.toLowerCase().includes(filters.search.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  },

  get equipmentStats() {
    const { equipment } = get();
    const total = equipment.length;
    const online = equipment.filter((eq) => eq.status === 'moving' || eq.status === 'loading' || eq.status === 'unloading').length;
    const offline = equipment.filter((eq) => eq.status === 'idle').length;
    const maintenance = equipment.filter((eq) => eq.status === 'maintenance').length;
    const charging = equipment.filter((eq) => eq.status === 'charging').length;
    const averageEfficiency = total > 0 ? Math.round(equipment.reduce((sum, eq) => sum + eq.efficiency, 0) / total) : 0;
    const averageBattery = total > 0 ? Math.round(equipment.reduce((sum, eq) => sum + eq.battery, 0) / total) : 0;

    return {
      total,
      online,
      offline,
      maintenance,
      charging,
      averageEfficiency,
      averageBattery,
    };
  },
}));
