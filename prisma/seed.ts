import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a sample warehouse
  const warehouse = await prisma.warehouse.create({
    data: {
      code: 'WH001',
      name: 'Main Warehouse',
      address: '123 Industrial Ave, City, State 12345',
    },
  });

  // Create zones
  const ambientZone = await prisma.zone.create({
    data: {
      code: 'AMB001',
      name: 'Ambient Storage Zone',
      temperature: 'AMBIENT',
      securityLevel: 'LOW',
      warehouseId: warehouse.id,
    },
  });

  const refrigeratedZone = await prisma.zone.create({
    data: {
      code: 'REF001',
      name: 'Refrigerated Zone',
      temperature: 'REFRIGERATED',
      securityLevel: 'MEDIUM',
      warehouseId: warehouse.id,
    },
  });

  // Create aisles
  const aisle1 = await prisma.aisle.create({
    data: {
      code: 'A001',
      number: 1,
      width: 2.5,
      height: 3.0,
      zoneId: ambientZone.id,
    },
  });

  // Create racks
  const rack1 = await prisma.rack.create({
    data: {
      code: 'R001',
      level: 1,
      orientation: 'FRONT',
      aisleId: aisle1.id,
    },
  });

  // Create bins
  const bin1 = await prisma.bin.create({
    data: {
      code: 'B001',
      capacity: 100,
      weightLimit: 50.0,
      rackId: rack1.id,
    },
  });

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      code: 'SUP001',
      name: 'Halal Foods Inc.',
      contact: '+1-555-0123',
      email: 'contact@halalfoods.com',
    },
  });

  // Create items
  const item1 = await prisma.item.create({
    data: {
      sku: 'SKU001',
      name: 'Organic Rice',
      category: 'Grains',
      weight: 1.0,
      hazardLevel: 'NONE',
      temperature: 'AMBIENT',
      minStock: 10,
      maxStock: 1000,
      supplierId: supplier1.id,
    },
  });

  // Create bin items
  await prisma.binItem.create({
    data: {
      quantity: 50,
      binId: bin1.id,
      itemId: item1.id,
    },
  });

  // Create users
  await prisma.user.create({
    data: {
      email: 'admin@warehouse.com',
      name: 'Admin User',
      role: 'ADMIN',
      warehouseId: warehouse.id,
    },
  });

  // Create sensors
  await prisma.sensor.create({
    data: {
      code: 'SEN001',
      name: 'Temperature Sensor 1',
      type: 'TEMPERATURE',
      zoneId: ambientZone.id,
      thresholdMin: 15.0,
      thresholdMax: 25.0,
    },
  });

  // Create robots
  await prisma.robot.create({
    data: {
      code: 'ROB001',
      name: 'ASRS Robot 1',
      type: 'STORAGE_RETRIEVAL',
      zoneId: ambientZone.id,
    },
  });

  // Create shipments
  await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHIP001',
      type: 'INBOUND',
      expectedArrival: new Date('2024-12-01'),
      warehouseId: warehouse.id,
      supplierId: supplier1.id,
      shipmentItems: {
        create: {
          quantity: 100,
          itemId: item1.id,
        },
      },
    },
  });

  // Halal-specific data
  const manufacturer = await prisma.manufacturer.create({
    data: {
      name: 'Halal Manufacturing Co.',
      companyDetails: 'Certified Halal Producer',
      contactInfo: 'contact@halalmfg.com',
    },
  });

  const certBody = await prisma.halalCertificationBody.create({
    data: {
      name: 'Islamic Halal Authority',
      licenseNumber: 'HALAL-001',
      validityPeriodStart: new Date('2023-01-01'),
      validityPeriodEnd: new Date('2025-12-31'),
    },
  });

  const product = await prisma.product.create({
    data: {
      sku: 'PROD001',
      name: 'Halal Beef Burger',
      description: '100% Halal beef patty',
      category: 'Meat Products',
      weight: 0.25,
      dimensions: '15x10x5 cm',
      manufacturerId: manufacturer.id,
      certifications: {
        create: {
          certificationBodyId: certBody.id,
          issueDate: new Date('2023-06-01'),
          expiryDate: new Date('2025-05-31'),
        },
      },
      ingredients: {
        create: {
          name: 'Halal Beef',
          description: 'Certified halal beef',
          supplierId: supplier1.id,
          certificationId: certBody.id,
        },
      },
    },
  });

  await prisma.warehouseStorage.create({
    data: {
      productId: product.id,
      location: 'B001',
      quantityOnHand: 200,
      batchLotNumber: 'LOT001',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
