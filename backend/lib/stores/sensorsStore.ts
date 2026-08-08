import { create } from 'zustand';
import { Sensor, SensorReading } from '@/lib/types';

interface SensorsState {
  sensors: Sensor[];
  readings: SensorReading[];
  loading: boolean;
  error: string | null;
  filters: {
    type: string;
    status: string;
    zoneId: string;
    search: string;
  };
  realTimeEnabled: boolean;

  // Actions
  setSensors: (sensors: Sensor[]) => void;
  addSensor: (sensor: Sensor) => void;
  updateSensor: (id: string, updates: Partial<Sensor>) => void;
  removeSensor: (id: string) => void;
  setReadings: (readings: SensorReading[]) => void;
  addReading: (reading: SensorReading) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<SensorsState['filters']>) => void;
  clearFilters: () => void;
  setRealTimeEnabled: (enabled: boolean) => void;

  // Computed
  filteredSensors: Sensor[];
  sensorStats: {
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
    faulty: number;
  };
  latestReadings: { [sensorId: string]: SensorReading };
  alertsTriggered: Sensor[];
}

export const useSensorsStore = create<SensorsState>((set, get) => ({
  sensors: [],
  readings: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    zoneId: 'all',
    search: '',
  },
  realTimeEnabled: true,

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

  setReadings: (readings) => set({ readings }),

  addReading: (reading) =>
    set((state) => ({
      readings: [reading, ...state.readings],
      sensors: state.sensors.map((sensor) =>
        sensor.id === reading.sensorId
          ? { ...sensor, readings: [reading, ...(sensor.readings || [])].slice(0, 10) }
          : sensor
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

  setRealTimeEnabled: (enabled) => set({ realTimeEnabled: enabled }),

  get filteredSensors() {
    const { sensors, filters } = get();
    return sensors.filter((sensor) => {
      const matchesType = filters.type === 'all' || sensor.type === filters.type;
      const matchesStatus = filters.status === 'all' || sensor.status === filters.status;
      const matchesZone = filters.zoneId === 'all' || sensor.zone?.id === filters.zoneId;
      const matchesSearch =
        !filters.search ||
        sensor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        sensor.code.toLowerCase().includes(filters.search.toLowerCase());

      return matchesType && matchesStatus && matchesZone && matchesSearch;
    });
  },

  get sensorStats() {
    const { sensors } = get();
    return {
      total: sensors.length,
      active: sensors.filter((s) => s.status === 'ACTIVE').length,
      inactive: sensors.filter((s) => s.status === 'INACTIVE').length,
      maintenance: sensors.filter((s) => s.status === 'MAINTENANCE').length,
      faulty: sensors.filter((s) => s.status === 'FAULTY').length,
    };
  },

  get latestReadings() {
    const { readings } = get();
    const latest: { [sensorId: string]: SensorReading } = {};

    readings.forEach((reading) => {
      if (!latest[reading.sensorId] ||
          new Date(reading.timestamp) > new Date(latest[reading.sensorId].timestamp)) {
        latest[reading.sensorId] = reading;
      }
    });

    return latest;
  },

  get alertsTriggered() {
    const { sensors, latestReadings } = get();
    return sensors.filter((sensor) => {
      const latestReading = latestReadings[sensor.id];
      if (!latestReading) return false;

      const value = latestReading.value;
      const min = sensor.thresholdMin;
      const max = sensor.thresholdMax;

      return (min !== undefined && value < min) || (max !== undefined && value > max);
    });
  },
}));
