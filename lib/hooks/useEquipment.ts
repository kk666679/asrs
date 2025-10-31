import { useEffect } from 'react';
import { useEquipmentStore } from '@/lib/stores/equipmentStore';
import { api } from '@/lib/api';
import { useRealtimeUpdates } from './useWebSocket';
import { Equipment } from '@/lib/types';

export const useEquipment = () => {
  const store = useEquipmentStore();
  const { updates, isConnected } = useRealtimeUpdates();

  // Handle real-time updates
  useEffect(() => {
    if (!isConnected) return;

    updates.forEach((update) => {
      if (update.type === 'EQUIPMENT_STATUS') {
        const equipmentUpdate = update.data as Equipment;
        store.updateEquipment(equipmentUpdate.id, equipmentUpdate);
      }
    });
  }, [updates, isConnected, store]);

  const fetchEquipment = async (params?: any) => {
    try {
      store.setLoading(true);
      store.setError(null);

      const response = await api.equipment.getAll(params);
      store.setEquipment(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch equipment';
      store.setError(message);
    } finally {
      store.setLoading(false);
    }
  };

  const updateEquipmentStatus = async (id: string, status: string) => {
    try {
      store.setError(null);

      // Optimistic update
      const equipment = store.equipment.find(eq => eq.id === id);
      if (equipment) {
        store.updateEquipment(id, { status: status as any });
      }

      await api.equipment.updateStatus(id, status);
    } catch (error) {
      // Revert optimistic update on error
      if (equipment) {
        store.updateEquipment(id, { status: equipment.status });
      }

      const message = error instanceof Error ? error.message : 'Failed to update equipment status';
      store.setError(message);
      throw error;
    }
  };

  const scheduleMaintenance = async (id: string, data: any) => {
    try {
      store.setError(null);
      await api.equipment.scheduleMaintenance(id, data);

      // Refresh equipment data to get updated maintenance info
      await fetchEquipment();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to schedule maintenance';
      store.setError(message);
      throw error;
    }
  };

  return {
    // State
    equipment: store.equipment,
    filteredEquipment: store.filteredEquipment,
    equipmentStats: store.equipmentStats,
    loading: store.loading,
    error: store.error,
    filters: store.filters,

    // Actions
    fetchEquipment,
    updateEquipmentStatus,
    scheduleMaintenance,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    refresh: () => fetchEquipment(),
  };
};
