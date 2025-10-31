// Shared TypeScript interfaces for ASRS system

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Zone extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  capacity: number;
  occupied: number;
}

export interface Bin extends BaseEntity {
  code: string;
  zoneId: string;
  zone: Zone;
  location: {
    aisle: string;
    shelf: string;
    position: string;
  };
  status: 'EMPTY' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  item?: Item;
}

export interface Item extends BaseEntity {
  sku: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitCost: number;
  supplier: Supplier;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  bin?: Bin;
}

export interface Product extends BaseEntity {
  sku: string;
  name: string;
  description?: string;
  category: string;
  manufacturer: {
    id: string;
    name: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
}

export interface Supplier extends BaseEntity {
  name: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  totalItems: number;
  rating?: number;
}

export interface Robot extends BaseEntity {
  code: string;
  name: string;
  type: 'STORAGE_RETRIEVAL' | 'CONVEYOR' | 'SORTING' | 'PACKING' | 'TRANSPORT';
  status: 'IDLE' | 'WORKING' | 'MAINTENANCE' | 'ERROR' | 'OFFLINE';
  location: string | null;
  batteryLevel: number | null;
  zone: Zone | null;
  commands: RobotCommand[];
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export interface RobotCommand extends BaseEntity {
  robotId: string;
  type: 'MOVE' | 'PICK' | 'PLACE' | 'SCAN' | 'CALIBRATE' | 'EMERGENCY_STOP';
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  parameters: Record<string, any>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface Equipment extends BaseEntity {
  name: string;
  type: 'shuttle' | 'conveyor' | 'vlm' | 'robot';
  status: 'online' | 'offline' | 'maintenance' | 'charging';
  battery?: number;
  location: string;
  task?: string;
  throughput?: number;
  currentFloor?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export interface Sensor extends BaseEntity {
  code: string;
  name: string;
  type: 'TEMPERATURE' | 'HUMIDITY' | 'WEIGHT' | 'PRESSURE' | 'MOTION' | 'LIGHT' | 'VIBRATION';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'FAULTY';
  location?: string;
  thresholdMin?: number;
  thresholdMax?: number;
  zone?: Zone;
  bin?: Bin;
  readings: SensorReading[];
}

export interface SensorReading extends BaseEntity {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface Alert extends BaseEntity {
  type: 'warning' | 'critical' | 'info' | 'maintenance';
  title: string;
  description: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  equipment?: string;
  zone?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'equipment' | 'sensor' | 'system' | 'maintenance' | 'security';
}

export interface MaintenanceTask extends BaseEntity {
  title: string;
  description: string;
  equipment: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  estimatedHours: number;
  actualHours?: number;
  cost?: number;
  notes?: string;
  zone?: string;
}

export interface Report extends BaseEntity {
  title: string;
  description: string;
  type: 'performance' | 'equipment' | 'efficiency' | 'maintenance' | 'sensor' | 'inventory';
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  generatedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
  parameters?: {
    dateRange: { start: string; end: string };
    equipment?: string[];
    zones?: string[];
  };
}

export interface AnalyticsData {
  summary: {
    totalItems: number;
    activeBins: number;
    todaysMovements: number;
    pendingTasks: number;
  };
  kpis: {
    inventoryTurnover: number;
    spaceUtilization: number;
    stockAlertsCount: number;
  };
  alerts: Array<{
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    minStock: number;
    status: string;
  }>;
  trends: Array<{
    date: string;
    movements: number;
  }>;
}

export interface InventoryStats {
  totalItems: number;
  totalProducts: number;
  totalSuppliers: number;
  lowStockItems: number;
  outOfStockItems: number;
  activeSuppliers: number;
  totalValue: number;
  averageStockLevel: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// WebSocket event types
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export interface RealtimeUpdate {
  type: 'EQUIPMENT_STATUS' | 'SENSOR_READING' | 'ALERT_CREATED' | 'ROBOT_COMMAND' | 'MAINTENANCE_UPDATE';
  data: any;
}

// Form types
export interface FilterOptions {
  search?: string;
  status?: string;
  type?: string;
  priority?: string;
  zoneId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Notification types
export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
