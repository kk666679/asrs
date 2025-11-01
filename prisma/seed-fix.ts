import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-001' },
    update: {},
    create: {
      code: 'WH-001',
      name: 'Main Warehouse',
      address: '123 Warehouse St'
    }
  });

  // Create default zone
  const zone = await prisma.zone.upsert({
    where: { code: 'ZONE-A' },
    update: {},
    create: {
      code: 'ZONE-A',
      name: 'Zone A',
      temperature: 'AMBIENT',
      securityLevel: 'MEDIUM',
      warehouseId: warehouse.id
    }
  });

  // Create default supplier
  const supplier = await prisma.supplier.upsert({
    where: { code: 'SUP-001' },
    update: {},
    create: {
      code: 'SUP-001',
      name: 'Default Supplier',
      contact: 'John Doe',
      email: 'supplier@example.com',
      status: 'ACTIVE'
    }
  });

  // Create default aisle
  const aisle = await prisma.aisle.upsert({
    where: { code: 'AISLE-001' },
    update: {},
    create: {
      code: 'AISLE-001',
      number: 1,
      width: 3.0,
      height: 10.0,
      zoneId: zone.id
    }
  });

  console.log('Database seeded with default data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });