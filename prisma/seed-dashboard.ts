import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-001' },
    update: {},
    create: {
      code: 'WH-001',
      name: 'Main Distribution Center',
      address: '1234 Industrial Blvd, Warehouse City, WC 12345'
    }
  });

  // Create zones
  const zones = await Promise.all([
    prisma.zone.upsert({
      where: { code: 'ZONE-A' },
      update: {},
      create: { code: 'ZONE-A', name: 'Ambient Storage', temperature: 'AMBIENT', securityLevel: 'MEDIUM', warehouseId: warehouse.id }
    }),
    prisma.zone.upsert({
      where: { code: 'ZONE-B' },
      update: {},
      create: { code: 'ZONE-B', name: 'Cold Storage', temperature: 'REFRIGERATED', securityLevel: 'HIGH', warehouseId: warehouse.id }
    }),
    prisma.zone.upsert({
      where: { code: 'ZONE-C' },
      update: {},
      create: { code: 'ZONE-C', name: 'Frozen Storage', temperature: 'FROZEN', securityLevel: 'HIGH', warehouseId: warehouse.id }
    })
  ]);

  // Create aisles
  const aisles = await Promise.all([
    prisma.aisle.upsert({
      where: { code: 'A-01' },
      update: {},
      create: { code: 'A-01', number: 1, width: 3.5, height: 12.0, zoneId: zones[0].id }
    }),
    prisma.aisle.upsert({
      where: { code: 'A-02' },
      update: {},
      create: { code: 'A-02', number: 2, width: 3.5, height: 12.0, zoneId: zones[0].id }
    }),
    prisma.aisle.upsert({
      where: { code: 'B-01' },
      update: {},
      create: { code: 'B-01', number: 1, width: 4.0, height: 10.0, zoneId: zones[1].id }
    })
  ]);

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { code: 'SUP-001' },
      update: {},
      create: { code: 'SUP-001', name: 'TechCorp Electronics', contact: 'John Smith', email: 'orders@techcorp.com', status: 'ACTIVE' }
    }),
    prisma.supplier.upsert({
      where: { code: 'SUP-002' },
      update: {},
      create: { code: 'SUP-002', name: 'Industrial Tools Ltd', contact: 'Sarah Johnson', email: 'supply@indtools.com', status: 'ACTIVE' }
    }),
    prisma.supplier.upsert({
      where: { code: 'SUP-003' },
      update: {},
      create: { code: 'SUP-003', name: 'FoodFresh Co', contact: 'Mike Wilson', email: 'logistics@foodfresh.com', status: 'ACTIVE' }
    })
  ]);

  // Create items
  const items = await Promise.all([
    prisma.item.upsert({
      where: { sku: 'ELEC-001' },
      update: {},
      create: { sku: 'ELEC-001', name: 'Wireless Router', category: 'Electronics', weight: 0.8, hazardLevel: 'NONE', temperature: 'AMBIENT', minStock: 50, maxStock: 200, supplierId: suppliers[0].id }
    }),
    prisma.item.upsert({
      where: { sku: 'ELEC-002' },
      update: {},
      create: { sku: 'ELEC-002', name: 'LED Monitor 24"', category: 'Electronics', weight: 4.2, hazardLevel: 'NONE', temperature: 'AMBIENT', minStock: 25, maxStock: 100, supplierId: suppliers[0].id }
    }),
    prisma.item.upsert({
      where: { sku: 'TOOL-001' },
      update: {},
      create: { sku: 'TOOL-001', name: 'Power Drill Set', category: 'Tools', weight: 2.1, hazardLevel: 'LOW', temperature: 'AMBIENT', minStock: 30, maxStock: 120, supplierId: suppliers[1].id }
    }),
    prisma.item.upsert({
      where: { sku: 'FOOD-001' },
      update: {},
      create: { sku: 'FOOD-001', name: 'Frozen Pizza 12"', category: 'Food', weight: 0.6, hazardLevel: 'NONE', temperature: 'FROZEN', minStock: 100, maxStock: 500, supplierId: suppliers[2].id }
    }),
    prisma.item.upsert({
      where: { sku: 'FOOD-002' },
      update: {},
      create: { sku: 'FOOD-002', name: 'Fresh Milk 1L', category: 'Food', weight: 1.0, hazardLevel: 'NONE', temperature: 'REFRIGERATED', minStock: 200, maxStock: 800, supplierId: suppliers[2].id }
    })
  ]);

  // Create robots
  const robots = await Promise.all([
    prisma.robot.upsert({
      where: { code: 'AMR-001' },
      update: {},
      create: { code: 'AMR-001', name: 'Storage Robot Alpha', type: 'STORAGE_RETRIEVAL', status: 'WORKING', location: 'Zone A-1', batteryLevel: 85, zoneId: zones[0].id }
    }),
    prisma.robot.upsert({
      where: { code: 'AMR-002' },
      update: {},
      create: { code: 'AMR-002', name: 'Transport Robot Beta', type: 'TRANSPORT', status: 'IDLE', location: 'Zone A-2', batteryLevel: 92, zoneId: zones[0].id }
    }),
    prisma.robot.upsert({
      where: { code: 'AMR-003' },
      update: {},
      create: { code: 'AMR-003', name: 'Sorting Robot Gamma', type: 'SORTING', status: 'WORKING', location: 'Zone B-1', batteryLevel: 78, zoneId: zones[1].id }
    }),
    prisma.robot.upsert({
      where: { code: 'AMR-004' },
      update: {},
      create: { code: 'AMR-004', name: 'Packing Robot Delta', type: 'PACKING', status: 'MAINTENANCE', location: 'Maintenance Bay', batteryLevel: 45, zoneId: zones[0].id }
    }),
    prisma.robot.upsert({
      where: { code: 'AMR-005' },
      update: {},
      create: { code: 'AMR-005', name: 'Conveyor Robot Epsilon', type: 'CONVEYOR', status: 'ERROR', location: 'Zone C-1', batteryLevel: 12, zoneId: zones[2].id }
    })
  ]);

  // Create inventory records
  await Promise.all([
    prisma.inventory.upsert({
      where: { id: 'inv-001' },
      update: {},
      create: { id: 'inv-001', itemId: items[0].id, location: 'A-01-01-01', quantity: 150, minStock: 50, maxStock: 200, status: 'ACTIVE' }
    }),
    prisma.inventory.upsert({
      where: { id: 'inv-002' },
      update: {},
      create: { id: 'inv-002', itemId: items[1].id, location: 'A-01-02-01', quantity: 75, minStock: 25, maxStock: 100, status: 'ACTIVE' }
    }),
    prisma.inventory.upsert({
      where: { id: 'inv-003' },
      update: {},
      create: { id: 'inv-003', itemId: items[2].id, location: 'A-02-01-01', quantity: 8, minStock: 30, maxStock: 120, status: 'ACTIVE' }
    }),
    prisma.inventory.upsert({
      where: { id: 'inv-004' },
      update: {},
      create: { id: 'inv-004', itemId: items[3].id, location: 'C-01-01-01', quantity: 450, minStock: 100, maxStock: 500, status: 'ACTIVE' }
    }),
    prisma.inventory.upsert({
      where: { id: 'inv-005' },
      update: {},
      create: { id: 'inv-005', itemId: items[4].id, location: 'B-01-01-01', quantity: 0, minStock: 200, maxStock: 800, status: 'ACTIVE' }
    })
  ]);

  // Create sensors
  await Promise.all([
    prisma.sensor.upsert({
      where: { code: 'TEMP-001' },
      update: {},
      create: { code: 'TEMP-001', name: 'Zone A Temperature', type: 'TEMPERATURE', status: 'ACTIVE', location: 'Zone A Center', zoneId: zones[0].id, thresholdMin: 18, thresholdMax: 25 }
    }),
    prisma.sensor.upsert({
      where: { code: 'TEMP-002' },
      update: {},
      create: { code: 'TEMP-002', name: 'Cold Storage Temp', type: 'TEMPERATURE', status: 'ACTIVE', location: 'Zone B Center', zoneId: zones[1].id, thresholdMin: 2, thresholdMax: 8 }
    }),
    prisma.sensor.upsert({
      where: { code: 'HUM-001' },
      update: {},
      create: { code: 'HUM-001', name: 'Zone A Humidity', type: 'HUMIDITY', status: 'ACTIVE', location: 'Zone A Center', zoneId: zones[0].id, thresholdMin: 40, thresholdMax: 60 }
    })
  ]);

  console.log('Dashboard database seeded successfully!');
  console.log(`Created: ${zones.length} zones, ${suppliers.length} suppliers, ${items.length} items, ${robots.length} robots`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });