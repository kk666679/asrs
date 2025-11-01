// Shared types for the ASRS system

export interface Equipment {
  id: string;
  name: string;
  type: 'forklift' | 'conveyor' | 'pallet' | 'sorting' | 'storage_retrieval';
  model: string;
  status: 'idle' | 'moving' | 'charging' | 'error' | 'maintenance' | 'paused' | 'loading' | 'unloading';
  battery: number;
  location: string;
  loadKg: number;
  currentLoad: number;
  efficiency: number;
  temperature: number;
  tasksCompleted: number;
  lastMaintenance: string;
  x?: number;
  y?: number;
}

export interface Robot {
  id: string;
  code: string;
  name: string;
  type: 'STORAGE_RETRIEVAL' | 'CONVEYOR' | 'SORTING' | 'PACKING' | 'TRANSPORT';
  status: 'IDLE' | 'WORKING' | 'MAINTENANCE' | 'ERROR' | 'OFFLINE';
  location?: string;
  batteryLevel?: number;
  lastMaintenance?: Date;
  zoneId: string;
}

export interface Sensor {
  id: string;
  code: string;
  name: string;
  type: 'TEMPERATURE' | 'HUMIDITY' | 'WEIGHT' | 'PRESSURE' | 'MOTION' | 'LIGHT' | 'VIBRATION';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'FAULTY';
  location?: string;
  binId?: string;
  zoneId?: string;
  calibrationDate?: Date;
  lastMaintenance?: Date;
  thresholdMin?: number;
  thresholdMax?: number;
}

export interface Alert {
  id: string;
  type: 'LOW_STOCK' | 'OVERSTOCK' | 'EXPIRY_WARNING' | 'QUALITY_ISSUE' | 'EQUIPMENT_FAILURE' | 'SENSOR_ALERT';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  itemId?: string;
  binId?: string;
  equipmentId?: string;
  sensorId?: string;
  createdAt: Date;
  resolvedAt?: Date;
  acknowledged: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  weight: number;
  hazardLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  temperature: 'AMBIENT' | 'REFRIGERATED' | 'FROZEN';
  minStock: number;
  maxStock?: number;
  barcode?: string;
  supplierId: string;
  quantity: number;
  location: string;
  lastCounted?: Date;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  warehouseId: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and search types
export interface EquipmentFilters {
  type?: string;
  status?: string;
  search?: string;
}

export interface InventoryFilters {
  category?: string;
  supplier?: string;
  status?: string;
  search?: string;
}

export interface AlertFilters {
  type?: string;
  severity?: string;
  acknowledged?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// WebSocket event types
export interface WebSocketEvent {
  type: 'EQUIPMENT_UPDATE' | 'SENSOR_READING' | 'ALERT_CREATED' | 'INVENTORY_CHANGE' | 'ROBOT_COMMAND' | 'MAINTENANCE_CREATED' | 'MAINTENANCE_UPDATED' | 'OPERATION_CREATED' | 'OPERATION_UPDATED' | 'SHIPMENT_CREATED' | 'SHIPMENT_UPDATED' | 'LOCATION_CREATED' | 'LOCATION_UPDATED' | 'ITEM_CREATED' | 'ITEM_UPDATED';
  payload: any;
  timestamp: Date;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: Date;
}

export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

export interface Maintenance {
  id: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE' | 'INSPECTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  equipmentId?: string;
  robotId?: string;
  sensorId?: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  actualDuration?: number;
  estimatedDuration: number;
  cost?: number;
  technician?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceFilters {
  type?: string;
  priority?: string;
  status?: string;
  equipmentId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
export interface Operation {
  id: string;
  type: "PICKING" | "PACKING" | "SORTING" | "LOADING" | "UNLOADING" | "MOVEMENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "FAILED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  itemId: string;
  quantity: number;
  sourceLocation?: string;
  destinationLocation?: string;
  assignedRobotId?: string;
  assignedUserId?: string;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shipment {
  id: string;
  type: "INBOUND" | "OUTBOUND";
  status: "PENDING" | "IN_TRANSIT" | "RECEIVED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  reference: string;
  supplierId?: string;
  customerId?: string;
  items: ShipmentItem[];
  totalWeight: number;
  totalVolume: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  scheduledDate: Date;
  actualDate?: Date;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentItem {
  itemId: string;
  quantity: number;
  unitPrice?: number;
}

export interface Location {
  id: string;
  code: string;
  type: "BIN" | "SHELF" | "FLOOR" | "CONVEYOR" | "DOCK";
  zoneId: string;
  aisle?: string;
  rack?: string;
  level?: string;
  position?: string;
  coordinates: {
    x: number;
    y: number;
    z?: number;
  };
  capacity: number;
  currentLoad: number;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BLOCKED";
  temperature?: number;
  humidity?: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  unit: "PIECE" | "KG" | "LITER" | "BOX" | "PALLET";
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  hazardLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  storageRequirements: {
    temperature: "AMBIENT" | "REFRIGERATED" | "FROZEN";
    humidity?: number;
    specialConditions?: string[];
  };
  supplierId: string;
  barcode?: string;
  qrCode?: string;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationFilters {
  type?: string;
  status?: string;
  priority?: string;
  assignedRobotId?: string;
  assignedUserId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ShipmentFilters {
  type?: string;
  status?: string;
  priority?: string;
  supplierId?: string;
  customerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface LocationFilters {
  type?: string;
  zoneId?: string;
  status?: string;
  search?: string;
}

export interface ItemFilters {
  category: string;
  subcategory: string;
  supplierId: string;
  hazardLevel: string;
  status: string;
  search: string;
}

export interface Transaction {
  id: string;
  type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT';
  itemId: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reference?: string;
  userId: string;
  timestamp: Date;
  notes?: string;
}

export interface Movement {
  id: string;
  type: 'PUTAWAY' | 'PICKING' | 'TRANSFER' | 'ADJUSTMENT' | 'COUNT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  itemId: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}
