import { z } from 'zod';

export const createItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  weight: z.number().positive('Weight must be positive'),
  hazardLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).default('NONE'),
  temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).default('AMBIENT'),
  minStock: z.number().min(0).default(0),
  maxStock: z.number().positive().optional(),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  barcode: z.string().optional()
});

export const createBinSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  capacity: z.number().positive('Capacity must be positive'),
  weightLimit: z.number().positive('Weight limit must be positive'),
  rackId: z.string().min(1, 'Rack ID is required'),
  barcode: z.string().optional()
});

export const createSensorSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['TEMPERATURE', 'HUMIDITY', 'WEIGHT', 'PRESSURE', 'MOTION', 'LIGHT', 'VIBRATION']),
  location: z.string().optional(),
  binId: z.string().optional(),
  zoneId: z.string().optional(),
  thresholdMin: z.number().optional(),
  thresholdMax: z.number().optional()
});

export const sensorReadingSchema = z.object({
  sensorId: z.string().min(1, 'Sensor ID is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  quality: z.number().min(0).max(100).default(100)
});

export const createMovementSchema = z.object({
  type: z.enum(['PUTAWAY', 'PICKING', 'TRANSFER', 'ADJUSTMENT', 'COUNT']),
  quantity: z.number().positive('Quantity must be positive'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  binItemId: z.string().min(1, 'Bin item ID is required'),
  fromBinId: z.string().optional(),
  toBinId: z.string().optional(),
  userId: z.string().min(1, 'User ID is required')
});

export const createShipmentSchema = z.object({
  shipmentNumber: z.string().min(1, 'Shipment number is required'),
  type: z.enum(['INBOUND', 'OUTBOUND', 'TRANSFER']),
  expectedArrival: z.string().datetime().optional(),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  barcode: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    quantity: z.number().positive('Quantity must be positive')
  }))
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const barcodeSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  type: z.enum(['item', 'bin', 'shipment']).optional()
});

export const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d']).default('30d'),
  warehouseId: z.string().optional(),
  zoneId: z.string().optional(),
  includeAlerts: z.coerce.boolean().default(false)
});