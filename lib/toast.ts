import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 6000,
    });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 5000,
    });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
    });
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id);
  },
};

// Equipment-specific toasts
export const equipmentToast = {
  statusChanged: (name: string, status: string) => {
    toast.success(`Equipment Updated`, `${name} is now ${status}`);
  },

  maintenanceScheduled: (name: string) => {
    toast.success(`Maintenance Scheduled`, `${name} has been scheduled for maintenance`);
  },

  connectionLost: (name: string) => {
    toast.error(`Connection Lost`, `Lost connection to ${name}`);
  },

  connectionRestored: (name: string) => {
    toast.success(`Connection Restored`, `${name} is back online`);
  },

  batteryLow: (name: string, level: number) => {
    toast.warning(`Low Battery`, `${name} battery at ${level}%`);
  },

  taskCompleted: (name: string, task: string) => {
    toast.success(`Task Completed`, `${name} finished: ${task}`);
  },

  errorOccurred: (name: string, error: string) => {
    toast.error(`Equipment Error`, `${name}: ${error}`);
  },
};

// Inventory-specific toasts
export const inventoryToast = {
  stockLow: (itemName: string, currentStock: number, minStock: number) => {
    toast.warning(
      `Low Stock Alert`,
      `${itemName}: ${currentStock} remaining (min: ${minStock})`
    );
  },

  stockOut: (itemName: string) => {
    toast.error(`Stock Out`, `${itemName} is out of stock`);
  },

  itemAdded: (itemName: string, quantity: number) => {
    toast.success(`Item Added`, `${quantity} units of ${itemName} added to inventory`);
  },

  itemRemoved: (itemName: string, quantity: number) => {
    toast.info(`Item Removed`, `${quantity} units of ${itemName} removed from inventory`);
  },

  inventoryUpdated: () => {
    toast.success(`Inventory Updated`, `Inventory levels have been synchronized`);
  },
};

// Robot-specific toasts
export const robotToast = {
  commandSent: (robotName: string, command: string) => {
    toast.info(`Command Sent`, `${command} sent to ${robotName}`);
  },

  taskAssigned: (robotName: string, task: string) => {
    toast.success(`Task Assigned`, `${robotName} assigned: ${task}`);
  },

  emergencyStop: (robotName: string) => {
    toast.error(`Emergency Stop`, `${robotName} has been stopped`);
  },

  pathBlocked: (robotName: string) => {
    toast.warning(`Path Blocked`, `${robotName} path is obstructed`);
  },

  chargingStarted: (robotName: string) => {
    toast.info(`Charging Started`, `${robotName} is now charging`);
  },

  chargingCompleted: (robotName: string) => {
    toast.success(`Charging Complete`, `${robotName} is fully charged`);
  },
};

// System-specific toasts
export const systemToast = {
  connected: () => {
    toast.success(`System Connected`, `Real-time updates are now active`);
  },

  disconnected: () => {
    toast.warning(`System Disconnected`, `Real-time updates are unavailable`);
  },

  reconnecting: () => {
    toast.loading(`Reconnecting...`);
  },

  dataRefreshed: () => {
    toast.success(`Data Refreshed`, `All data has been updated`);
  },

  backupCompleted: () => {
    toast.success(`Backup Complete`, `System backup has been created`);
  },

  maintenanceMode: (enabled: boolean) => {
    if (enabled) {
      toast.warning(`Maintenance Mode`, `System is now in maintenance mode`);
    } else {
      toast.success(`Maintenance Complete`, `System is back to normal operation`);
    }
  },
};