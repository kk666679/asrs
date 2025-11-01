import { create } from 'zustand';
import { Location, LocationFilters } from '@/lib/types';

interface LocationsState {
  locations: Location[];
  loading: boolean;
  error: string | null;
  filters: LocationFilters;

  // Actions
  setLocations: (locations: Location[]) => void;
  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  removeLocation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<LocationFilters>) => void;
  clearFilters: () => void;

  // Computed
  filteredLocations: Location[];
  locationsStats: {
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
    blocked: number;
    byType: Record<string, number>;
    totalCapacity: number;
    usedCapacity: number;
    utilizationRate: number;
    averageTemperature: number;
    averageHumidity: number;
  };
}

export const useLocationsStore = create<LocationsState>((set, get) => ({
  locations: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    zoneId: 'all',
    status: 'all',
    search: '',
  },

  setLocations: (locations) => set({ locations }),

  addLocation: (location) =>
    set((state) => ({ locations: [...state.locations, location] })),

  updateLocation: (id, updates) =>
    set((state) => ({
      locations: state.locations.map((loc) =>
        loc.id === id ? { ...loc, ...updates, updatedAt: new Date() } : loc
      ),
    })),

  removeLocation: (id) =>
    set((state) => ({
      locations: state.locations.filter((loc) => loc.id !== id),
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
        zoneId: 'all',
        status: 'all',
        search: '',
      },
    }),

  get filteredLocations() {
    const { locations, filters } = get();
    return locations.filter((loc) => {
      const matchesType = filters.type === 'all' || loc.type === filters.type;
      const matchesZone = filters.zoneId === 'all' || loc.zoneId === filters.zoneId;
      const matchesStatus = filters.status === 'all' || loc.status === filters.status;
      const matchesSearch =
        !filters.search ||
        loc.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        loc.aisle?.toLowerCase().includes(filters.search.toLowerCase()) ||
        loc.rack?.toLowerCase().includes(filters.search.toLowerCase());

      return matchesType && matchesZone && matchesStatus && matchesSearch;
    });
  },

  get locationsStats() {
    const { locations } = get();
    const total = locations.length;
    const active = locations.filter((loc) => loc.status === 'ACTIVE').length;
    const inactive = locations.filter((loc) => loc.status === 'INACTIVE').length;
    const maintenance = locations.filter((loc) => loc.status === 'MAINTENANCE').length;
    const blocked = locations.filter((loc) => loc.status === 'BLOCKED').length;

    const byType = locations.reduce((acc, loc) => {
      acc[loc.type] = (acc[loc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCapacity = locations.reduce((sum, loc) => sum + loc.capacity, 0);
    const usedCapacity = locations.reduce((sum, loc) => sum + loc.currentLoad, 0);
    const utilizationRate = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

    const locationsWithTemp = locations.filter(loc => loc.temperature !== undefined);
    const averageTemperature = locationsWithTemp.length > 0
      ? locationsWithTemp.reduce((sum, loc) => sum + (loc.temperature || 0), 0) / locationsWithTemp.length
      : 0;

    const locationsWithHumidity = locations.filter(loc => loc.humidity !== undefined);
    const averageHumidity = locationsWithHumidity.length > 0
      ? locationsWithHumidity.reduce((sum, loc) => sum + (loc.humidity || 0), 0) / locationsWithHumidity.length
      : 0;

    return {
      total,
      active,
      inactive,
      maintenance,
      blocked,
      byType,
      totalCapacity,
      usedCapacity,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      averageTemperature: Math.round(averageTemperature * 100) / 100,
      averageHumidity: Math.round(averageHumidity * 100) / 100,
    };
  },
}));
