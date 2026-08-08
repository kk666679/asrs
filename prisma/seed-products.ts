import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get existing data
  const warehouse = await prisma.warehouse.findFirst();
  const zones = await prisma.zone.findMany();
  const suppliers = await prisma.supplier.findMany();
  const aisles = await prisma.aisle.findMany();

  if (!warehouse || zones.length === 0 || suppliers.length === 0) {
    console.log('Please run seed-dashboard.ts first');
    return;
  }

  // Create more items
  const items = [
    { sku: 'ELEC-003', name: 'Smartphone 128GB', category: 'Electronics', weight: 0.2, price: 699, supplier: 0 },
    { sku: 'ELEC-004', name: 'Laptop 15" Intel i7', category: 'Electronics', weight: 2.1, price: 1299, supplier: 0 },
    { sku: 'ELEC-005', name: 'Wireless Headphones', category: 'Electronics', weight: 0.3, price: 199, supplier: 0 },
    { sku: 'ELEC-006', name: 'Gaming Mouse', category: 'Electronics', weight: 0.1, price: 79, supplier: 0 },
    { sku: 'ELEC-007', name: 'Mechanical Keyboard', category: 'Electronics', weight: 1.2, price: 149, supplier: 0 },
    
    { sku: 'TOOL-002', name: 'Cordless Screwdriver', category: 'Tools', weight: 0.8, price: 89, supplier: 1 },
    { sku: 'TOOL-003', name: 'Socket Wrench Set', category: 'Tools', weight: 3.2, price: 159, supplier: 1 },
    { sku: 'TOOL-004', name: 'Digital Multimeter', category: 'Tools', weight: 0.6, price: 79, supplier: 1 },
    { sku: 'TOOL-005', name: 'Angle Grinder', category: 'Tools', weight: 2.8, price: 129, supplier: 1 },
    
    { sku: 'FOOD-003', name: 'Organic Yogurt 500ml', category: 'Food', weight: 0.5, price: 4.99, supplier: 2 },
    { sku: 'FOOD-004', name: 'Fresh Bread Loaf', category: 'Food', weight: 0.8, price: 3.49, supplier: 2 },
    { sku: 'FOOD-005', name: 'Frozen Vegetables 1kg', category: 'Food', weight: 1.0, price: 5.99, supplier: 2 },
    { sku: 'FOOD-006', name: 'Canned Tomatoes 400g', category: 'Food', weight: 0.4, price: 1.99, supplier: 2 },
    { sku: 'FOOD-007', name: 'Pasta 500g', category: 'Food', weight: 0.5, price: 2.49, supplier: 2 },
    
    { sku: 'HOME-001', name: 'Vacuum Cleaner', category: 'Home & Garden', weight: 6.5, price: 299, supplier: 0 },
    { sku: 'HOME-002', name: 'Coffee Maker', category: 'Home & Garden', weight: 4.2, price: 149, supplier: 0 },
    { sku: 'HOME-003', name: 'Air Purifier', category: 'Home & Garden', weight: 8.1, price: 199, supplier: 0 },
    
    { sku: 'AUTO-001', name: 'Car Battery 12V', category: 'Automotive', weight: 18.5, price: 129, supplier: 1 },
    { sku: 'AUTO-002', name: 'Motor Oil 5L', category: 'Automotive', weight: 4.8, price: 39, supplier: 1 },
    { sku: 'AUTO-003', name: 'Brake Pads Set', category: 'Automotive', weight: 2.3, price: 89, supplier: 1 }
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        sku: item.sku,
        name: item.name,
        category: item.category,
        weight: item.weight,
        hazardLevel: item.category === 'Automotive' ? 'MEDIUM' : 'NONE',
        temperature: item.category === 'Food' ? (item.name.includes('Frozen') ? 'FROZEN' : item.name.includes('Fresh') || item.name.includes('Milk') || item.name.includes('Yogurt') ? 'REFRIGERATED' : 'AMBIENT') : 'AMBIENT',
        minStock: Math.floor(Math.random() * 50) + 10,
        maxStock: Math.floor(Math.random() * 200) + 100,
        supplierId: suppliers[item.supplier].id
      }
    });
  }

  // Create inventory for all items
  const allItems = await prisma.item.findMany();
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const quantity = Math.floor(Math.random() * 300);
    await prisma.inventory.upsert({
      where: { id: `inv-${item.sku}` },
      update: {},
      create: {
        id: `inv-${item.sku}`,
        itemId: item.id,
        location: `${String.fromCharCode(65 + (i % 3))}-${String(Math.floor(i/3) + 1).padStart(2, '0')}-01-01`,
        quantity: quantity,
        minStock: item.minStock,
        maxStock: item.maxStock,
        status: 'ACTIVE'
      }
    });
  }

  // Create racks and bins
  for (let i = 0; i < 10; i++) {
    const aisle = aisles[i % aisles.length];
    await prisma.rack.upsert({
      where: { code: `RACK-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        code: `RACK-${String(i + 1).padStart(3, '0')}`,
        level: Math.floor(i / 2) + 1,
        orientation: 'FRONT',
        aisleId: aisle.id,
        positionRow: (i % 5) + 1,
        positionColumn: Math.floor(i / 5) + 1,
        maxWeight: 10000,
        currentWeight: Math.floor(Math.random() * 8000),
        levels: 5,
        positionsPerLevel: 10
      }
    });
  }

  // Create sensor readings for analytics
  const sensors = await prisma.sensor.findMany();
  const now = new Date();
  for (const sensor of sensors) {
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
      let value;
      if (sensor.type === 'TEMPERATURE') {
        value = sensor.code.includes('TEMP-002') ? 
          4 + Math.random() * 2 : // Cold storage 4-6°C
          20 + Math.random() * 5; // Ambient 20-25°C
      } else {
        value = 45 + Math.random() * 10; // Humidity 45-55%
      }
      
      await prisma.sensorReading.create({
        data: {
          sensorId: sensor.id,
          value: value,
          unit: sensor.type === 'TEMPERATURE' ? '°C' : '%',
          timestamp: timestamp,
          quality: 95 + Math.random() * 5
        }
      });
    }
  }

  console.log(`Seeded ${items.length} additional products and inventory records`);
  console.log('Created racks, bins, and sensor readings for analytics');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });