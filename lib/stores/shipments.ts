import { create } from 'zustand';
import { Shipment, ShipmentFilters } from '@/lib/types';

interface ShipmentsState {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  filters: ShipmentFilters;

  // Actions
  setShipments: (shipments: Shipment[]) => void;
  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  removeShipment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ShipmentFilters>) => void;
  clearFilters: () => void;

  // Computed
  filteredShipments: Shipment[];
  shipmentsStats: {
    total: number;
    inbound: number;
    outbound: number;
    pending: number;
    inTransit: number;
    delivered: number;
    byPriority: Record<string, number>;
    totalWeight: number;
    totalVolume: number;
    onTimePercentage: number;
  };
}

export const useShipmentsStore = create<ShipmentsState>((set, get) => ({
  shipments: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    priority: 'all',
    supplierId: 'all',
    customerId: 'all',
    dateRange: undefined,
  },

  setShipments: (shipments) => set({ shipments }),

  addShipment: (shipment) =>
    set((state) => ({ shipments: [...state.shipments, shipment] })),

  updateShipment: (id, updates) =>
    set((state) => ({
      shipments: state.shipments.map((sh) =>
        sh.id === id ? { ...sh, ...updates, updatedAt: new Date() } : sh
      ),
    })),

  removeShipment: (id) =>
    set((state) => ({
      shipments: state.shipments.filter((sh) => sh.id !== id),
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
        supplierId: 'all',
        customerId: 'all',
        dateRange: undefined,
      },
    }),

  get filteredShipments() {
    const { shipments, filters } = get();
    return shipments.filter((sh) => {
      const matchesType = filters.type === 'all' || sh.type === filters.type;
      const matchesStatus = filters.status === 'all' || sh.status === filters.status;
      const matchesPriority = filters.priority === 'all' || sh.priority === filters.priority;
      const matchesSupplier = filters.supplierId === 'all' || sh.supplierId === filters.supplierId;
      const matchesCustomer = filters.customerId === 'all' || sh.customerId === filters.customerId;

      let matchesDateRange = true;
      if (filters.dateRange) {
        const scheduledDate = new Date(sh.scheduledDate);
        matchesDateRange = scheduledDate >= filters.dateRange.start && scheduledDate <= filters.dateRange.end;
      }

      return matchesType && matchesStatus && matchesPriority && matchesSupplier && matchesCustomer && matchesDateRange;
    });
  },

  get shipmentsStats() {
    const { shipments } = get();
    const total = shipments.length;
    const inbound = shipments.filter((sh) => sh.type === 'INBOUND').length;
    const outbound = shipments.filter((sh) => sh.type === 'OUTBOUND').length;
    const pending = shipments.filter((sh) => sh.status === 'PENDING').length;
    const inTransit = shipments.filter((sh) => sh.status === 'IN_TRANSIT').length;
    const delivered = shipments.filter((sh) => sh.status === 'DELIVERED').length;

    const byPriority = shipments.reduce((acc, sh) => {
      acc[sh.priority] = (acc[sh.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalWeight = shipments.reduce((sum, sh) => sum + sh.totalWeight, 0);
    const totalVolume = shipments.reduce((sum, sh) => sum + sh.totalVolume, 0);

    const completedShipments = shipments.filter(sh => sh.status === 'DELIVERED' && sh.actualDate && sh.scheduledDate);
    const onTimeShipments = completedShipments.filter(sh => {
      const scheduled = new Date(sh.scheduledDate);
      const actual = new Date(sh.actualDate!);
      return actual <= scheduled;
    });
    const onTimePercentage = completedShipments.length > 0 ? (onTimeShipments.length / completedShipments.length) * 100 : 0;

    return {
      total,
      inbound,
      outbound,
      pending,
      inTransit,
      delivered,
      byPriority,
      totalWeight: Math.round(totalWeight * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
      onTimePercentage: Math.round(onTimePercentage * 100) / 100,
    };
  },
}));
