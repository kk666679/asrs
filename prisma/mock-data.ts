import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data for development and testing
export const mockData = {
  warehouses: [
    {
      code: 'WH001',
      name: 'Main Warehouse',
      address: '123 Industrial Ave, City, State 12345',
    },
    {
      code: 'WH002',
      name: 'Secondary Warehouse',
      address: '456 Commerce Blvd, City, State 67890',
    },
  ],

  zones: [
    {
      code: 'AMB001',
      name: 'Ambient Storage Zone',
      temperature: 'AMBIENT' as const,
      securityLevel: 'LOW' as const,
    },
    {
      code: 'REF001',
      name: 'Refrigerated Zone',
      temperature: 'REFRIGERATED' as const,
      securityLevel: 'MEDIUM' as const,
    },
    {
      code: 'FRO001',
      name: 'Frozen Zone',
      temperature: 'FROZEN' as const,
      securityLevel: 'HIGH' as const,
    },
  ],

  suppliers: [
    {
      code: 'SUP001',
      name: 'Halal Foods Inc.',
      contact: '+1-555-0123',
      email: 'contact@halalfoods.com',
    },
    {
      code: 'SUP002',
      name: 'Organic Suppliers Ltd.',
      contact: '+1-555-0456',
      email: 'info@organicsuppliers.com',
    },
    {
      code: 'SUP003',
      name: 'Fresh Produce Co.',
      contact: '+1-555-0789',
      email: 'sales@freshproduce.com',
    },
  ],

  items: [
    {
      sku: 'SKU001',
      name: 'Organic Rice',
      category: 'Grains',
      weight: 1.0,
      hazardLevel: 'NONE' as const,
      temperature: 'AMBIENT' as const,
      minStock: 10,
      maxStock: 1000,
    },
    {
      sku: 'SKU002',
      name: 'Halal Chicken Breast',
      category: 'Meat',
      weight: 0.5,
      hazardLevel: 'LOW' as const,
      temperature: 'REFRIGERATED' as const,
      minStock: 5,
      maxStock: 200,
    },
    {
      sku: 'SKU003',
      name: 'Frozen Vegetables Mix',
      category: 'Vegetables',
      weight: 0.8,
      hazardLevel: 'NONE' as const,
      temperature: 'FROZEN' as const,
      minStock: 15,
      maxStock: 500,
    },
    {
      sku: 'SKU004',
      name: 'Organic Honey',
      category: 'Condiments',
      weight: 0.3,
      hazardLevel: 'NONE' as const,
      temperature: 'AMBIENT' as const,
      minStock: 20,
      maxStock: 300,
    },
    {
      sku: 'SKU005',
      name: 'Halal Beef Patties',
      category: 'Meat',
      weight: 0.25,
      hazardLevel: 'LOW' as const,
      temperature: 'FROZEN' as const,
      minStock: 8,
      maxStock: 150,
    },
  ],

  users: [
    {
      email: 'admin@warehouse.com',
      name: 'Admin User',
      role: 'ADMIN' as const,
    },
    {
      email: 'manager@warehouse.com',
      name: 'Warehouse Manager',
      role: 'MANAGER' as const,
    },
    {
      email: 'operator@warehouse.com',
      name: 'Warehouse Operator',
      role: 'OPERATOR' as const,
    },
    {
      email: 'viewer@warehouse.com',
      name: 'Viewer User',
      role: 'VIEWER' as const,
    },
  ],

  sensors: [
    {
      code: 'SEN001',
      name: 'Temperature Sensor 1',
      type: 'TEMPERATURE' as const,
      thresholdMin: 15.0,
      thresholdMax: 25.0,
    },
    {
      code: 'SEN002',
      name: 'Humidity Sensor 1',
      type: 'HUMIDITY' as const,
      thresholdMin: 30.0,
      thresholdMax: 60.0,
    },
    {
      code: 'SEN003',
      name: 'Weight Sensor 1',
      type: 'WEIGHT' as const,
      thresholdMin: 0.0,
      thresholdMax: 100.0,
    },
    {
      code: 'SEN004',
      name: 'Motion Sensor 1',
      type: 'MOTION' as const,
    },
  ],

  robots: [
    {
      code: 'ROB001',
      name: 'ASRS Robot 1',
      type: 'STORAGE_RETRIEVAL' as const,
    },
    {
      code: 'ROB002',
      name: 'Conveyor Robot 1',
      type: 'CONVEYOR' as const,
    },
    {
      code: 'ROB003',
      name: 'Sorting Robot 1',
      type: 'SORTING' as const,
    },
  ],

  manufacturers: [
    {
      name: 'Halal Manufacturing Co.',
      companyDetails: 'Certified Halal Producer',
      contactInfo: 'contact@halalmfg.com',
    },
    {
      name: 'Organic Foods Inc.',
      companyDetails: 'Organic Certified Producer',
      contactInfo: 'info@organicfoods.com',
    },
  ],

  halalCertificationBodies: [
    {
      name: 'Islamic Halal Authority',
      licenseNumber: 'HALAL-001',
      validityPeriodStart: new Date('2023-01-01'),
      validityPeriodEnd: new Date('2025-12-31'),
    },
    {
      name: 'Global Halal Trust',
      licenseNumber: 'HALAL-002',
      validityPeriodStart: new Date('2023-06-01'),
      validityPeriodEnd: new Date('2026-05-31'),
    },
  ],

  products: [
    {
      sku: 'PROD001',
      name: 'Halal Beef Burger',
      description: '100% Halal beef patty',
      category: 'Meat Products',
      weight: 0.25,
      dimensions: '15x10x5 cm',
    },
    {
      sku: 'PROD002',
      name: 'Organic Rice Bowl',
      description: 'Ready-to-eat organic rice meal',
      category: 'Prepared Foods',
      weight: 0.4,
      dimensions: '20x15x8 cm',
    },
    {
      sku: 'PROD003',
      name: 'Frozen Halal Pizza',
      description: 'Halal certified frozen pizza',
      category: 'Frozen Foods',
      weight: 0.6,
      dimensions: '30x30x3 cm',
    },
  ],
};

// Helper functions for creating mock data
export async function createMockWarehouse() {
  return await prisma.warehouse.create({
    data: mockData.warehouses[0],
  });
}

export async function createMockZones(warehouseId: string) {
  const zones = mockData.zones.map(zone => ({
    ...zone,
    warehouseId,
  }));

  return await prisma.zone.createMany({
    data: zones,
  });
}

export async function createMockSuppliers() {
  return await prisma.supplier.createMany({
    data: mockData.suppliers,
  });
}

export async function createMockItems(supplierIds: string[]) {
  const items = mockData.items.map((item, index) => ({
    ...item,
    supplierId: supplierIds[index % supplierIds.length],
  }));

  return await prisma.item.createMany({
    data: items,
  });
}

export async function createMockUsers(warehouseId: string) {
  const users = mockData.users.map(user => ({
    ...user,
    warehouseId,
  }));

  return await prisma.user.createMany({
    data: users,
  });
}

export async function createMockSensors(zoneIds: string[]) {
  const sensors = mockData.sensors.map((sensor, index) => ({
    ...sensor,
    zoneId: zoneIds[index % zoneIds.length],
  }));

  return await prisma.sensor.createMany({
    data: sensors,
  });
}

export async function createMockRobots(zoneIds: string[]) {
  const robots = mockData.robots.map((robot, index) => ({
    ...robot,
    zoneId: zoneIds[index % zoneIds.length],
  }));

  return await prisma.robot.createMany({
    data: robots,
  });
}

export async function createMockManufacturers() {
  return await prisma.manufacturer.createMany({
    data: mockData.manufacturers,
  });
}

export async function createMockHalalCertificationBodies() {
  return await prisma.halalCertificationBody.createMany({
    data: mockData.halalCertificationBodies,
  });
}

export async function createMockProducts(manufacturerIds: string[]) {
  const products = mockData.products.map((product, index) => ({
    ...product,
    manufacturerId: manufacturerIds[index % manufacturerIds.length],
  }));

  return await prisma.product.createMany({
    data: products,
  });
}

// Function to populate all mock data
export async function populateMockData() {
  try {
    // Create warehouse
    const warehouse = await createMockWarehouse();
    console.log('Created mock warehouse');

    // Create zones
    await createMockZones(warehouse.id);
    console.log('Created mock zones');

    // Create suppliers
    await createMockSuppliers();
    console.log('Created mock suppliers');

    // Get supplier IDs
    const suppliers = await prisma.supplier.findMany();
    const supplierIds = suppliers.map(s => s.id);

    // Create items
    await createMockItems(supplierIds);
    console.log('Created mock items');

    // Create users
    await createMockUsers(warehouse.id);
    console.log('Created mock users');

    // Get zone IDs
    const zones = await prisma.zone.findMany();
    const zoneIds = zones.map(z => z.id);

    // Create sensors
    await createMockSensors(zoneIds);
    console.log('Created mock sensors');

    // Create robots
    await createMockRobots(zoneIds);
    console.log('Created mock robots');

    // Create manufacturers
    await createMockManufacturers();
    console.log('Created mock manufacturers');

    // Create halal certification bodies
    await createMockHalalCertificationBodies();
    console.log('Created mock halal certification bodies');

    // Get manufacturer IDs
    const manufacturers = await prisma.manufacturer.findMany();
    const manufacturerIds = manufacturers.map(m => m.id);

    // Create products
    await createMockProducts(manufacturerIds);
    console.log('Created mock products');

    console.log('All mock data populated successfully!');
  } catch (error) {
    console.error('Error populating mock data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution for CLI
if (require.main === module) {
  populateMockData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
