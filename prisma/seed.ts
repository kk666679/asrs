import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  console.log('🧹 Clearing existing data...');
  await prisma.movement.deleteMany();
  await prisma.binItem.deleteMany();
  await prisma.bin.deleteMany();
  await prisma.rack.deleteMany();
  await prisma.aisle.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.robot.deleteMany();
  await prisma.warehouse.deleteMany();

  const warehouse = await prisma.warehouse.create({
    data: { code: 'WH001', name: 'Main Warehouse', address: '123 Industrial Ave' }
  });

  const zones = await Promise.all([
    prisma.zone.create({ data: { code: 'AMB', name: 'Ambient Zone', temperature: 'AMBIENT', securityLevel: 'LOW', warehouseId: warehouse.id } }),
    prisma.zone.create({ data: { code: 'REF', name: 'Refrigerated Zone', temperature: 'REFRIGERATED', securityLevel: 'MEDIUM', warehouseId: warehouse.id } }),
    prisma.zone.create({ data: { code: 'FRZ', name: 'Frozen Zone', temperature: 'FROZEN', securityLevel: 'HIGH', warehouseId: warehouse.id } })
  ]);

  const aisles = [];
  let aisleCounter = 1;
  for (let i = 0; i < 3; i++) {
    for (let j = 1; j <= 3; j++) {
      aisles.push(await prisma.aisle.create({
        data: { code: `A${aisleCounter.toString().padStart(3, '0')}`, number: j, width: 2.5, height: 4.0, zoneId: zones[i].id }
      }));
      aisleCounter++;
    }
  }

  const racks = [];
  let rackCounter = 1;
  for (const aisle of aisles) {
    for (let level = 1; level <= 3; level++) {
      racks.push(await prisma.rack.create({
        data: { code: `R${rackCounter.toString().padStart(3, '0')}`, level, orientation: 'FRONT', aisleId: aisle.id }
      }));
      rackCounter++;
    }
  }

  const bins = [];
  let binCounter = 1;
  for (const rack of racks.slice(0, 20)) {
    for (let i = 1; i <= 3; i++) {
      bins.push(await prisma.bin.create({
        data: { code: `B${binCounter.toString().padStart(3, '0')}`, capacity: 100, weightLimit: 50.0, rackId: rack.id }
      }));
      binCounter++;
    }
  }

  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { code: 'SUP001', name: 'Halal Foods Inc.', contact: '+1-555-0123', email: 'halal@foods.com' } }),
    prisma.supplier.create({ data: { code: 'SUP002', name: 'Fresh Produce Co.', contact: '+1-555-0124', email: 'fresh@produce.com' } })
  ]);

  const items = await Promise.all([
    prisma.item.create({ data: { sku: 'SKU001', name: 'Organic Rice', category: 'Grains', weight: 1.0, hazardLevel: 'NONE', temperature: 'AMBIENT', minStock: 10, maxStock: 1000, supplierId: suppliers[0].id } }),
    prisma.item.create({ data: { sku: 'SKU002', name: 'Fresh Milk', category: 'Dairy', weight: 1.0, hazardLevel: 'NONE', temperature: 'REFRIGERATED', minStock: 20, maxStock: 500, supplierId: suppliers[1].id } }),
    prisma.item.create({ data: { sku: 'SKU003', name: 'Frozen Vegetables', category: 'Vegetables', weight: 0.5, hazardLevel: 'NONE', temperature: 'FROZEN', minStock: 50, maxStock: 2000, supplierId: suppliers[1].id } })
  ]);

  for (let i = 0; i < Math.min(items.length, bins.length); i++) {
    await prisma.binItem.create({
      data: { id: randomUUID(), quantity: 50 + i * 10, binId: bins[i].id, itemId: items[i].id, batchNumber: `BATCH${i + 1}` }
    });
  }

  const user = await prisma.user.create({
    data: { email: 'admin@warehouse.com', name: 'Admin User', role: 'ADMIN', warehouseId: warehouse.id }
  });

  await Promise.all([
    prisma.sensor.create({ data: { code: 'SEN001', name: 'Temp Sensor 1', type: 'TEMPERATURE', zoneId: zones[0].id, thresholdMin: 15.0, thresholdMax: 25.0 } }),
    prisma.sensor.create({ data: { code: 'SEN002', name: 'Humidity Sensor 1', type: 'HUMIDITY', zoneId: zones[1].id, thresholdMin: 40.0, thresholdMax: 60.0 } })
  ]);

  await Promise.all([
    prisma.robot.create({ data: { code: 'ROB001', name: 'ASRS Robot 1', type: 'STORAGE_RETRIEVAL', zoneId: zones[0].id } }),
    prisma.robot.create({ data: { code: 'ROB002', name: 'ASRS Robot 2', type: 'STORAGE_RETRIEVAL', zoneId: zones[1].id } })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`   Warehouses: 1`);
  console.log(`   Zones: ${zones.length}`);
  console.log(`   Aisles: ${aisles.length}`);
  console.log(`   Racks: ${racks.length}`);
  console.log(`   Bins: ${bins.length}`);
  console.log(`   Items: ${items.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
