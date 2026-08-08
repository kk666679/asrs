import { create } from 'zustand';
import { Sensor } from '@/lib/types';

interface SensorState {
  sensors: Sensor[];
  loading: boolean;
  error: string | null;
  filters: {
    type?: string;
    status?: string;
    zoneId?: string;
    search?: string;
  };

  // Actions
  setSensors: (sensors: Sensor[]) => void;
  addSensor: (sensor: Sensor) => void;
  updateSensor: (id: string, updates: Partial<Sensor>) => void;
  removeSensor: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<SensorState['filters']>) => void;
  clearFilters: () => void;

  // Computed
  filteredSensors: Sensor[];
  sensorStats: {
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
    faulty: number;
    byType: Record<string, number>;
  };
}

export const useSensorStore = create<SensorState>((set, get) => ({
  sensors: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    zoneId: 'all',
    search: '',
  },

  setSensors: (sensors) => set({ sensors }),

  addSensor: (sensor) =>
    set((state) => ({ sensors: [...state.sensors, sensor] })),

  updateSensor: (id, updates) =>
    set((state) => ({
      sensors: state.sensors.map((sensor) =>
        sensor.id === id ? { ...sensor, ...updates } : sensor
      ),
    })),

  removeSensor: (id) =>
    set((state) => ({
      sensors: state.sensors.filter((sensor) => sensor.id !== id),
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

  get filteredSensors() {
    const { sensors, filters } = get();
    return sensors.filter((sensor) => {
      const matchesType = filters.type === 'all' || sensor.type === filters.type;
      const matchesStatus = filters.status === 'all' || sensor.status === filters.status;
      const matchesZone = filters.zoneId === 'all' || sensor.zoneId === filters.zoneId;
      const matchesSearch =
        !filters.search ||
        sensor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        sensor.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        (sensor.location && sensor.location.toLowerCase().includes(filters.search.toLowerCase()));

      return matchesType && matchesStatus && matchesZone && matchesSearch;
    });
  },

  get sensorStats() {
    const { sensors } = get();
    const total = sensors.length;
    const active = sensors.filter((sensor) => sensor.status === 'ACTIVE').length;
    const inactive = sensors.filter((sensor) => sensor.status === 'INACTIVE').length;
    const maintenance = sensors.filter((sensor) => sensor.status === 'MAINTENANCE').length;
    const faulty = sensors.filter((sensor) => sensor.status === 'FAULTY').length;

    const byType = sensors.reduce((acc, sensor) => {
      acc[sensor.type] = (acc[sensor.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      maintenance,
      faulty,
      byType,
    };
  },
}));
