import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const realProducts = [
  // Electronics
  { sku: 'ELEC-001', name: 'iPhone 15 Pro 256GB', category: 'Electronics', weight: 0.187, price: 1199, minStock: 5, maxStock: 50, barcode: '194253433989' },
  { sku: 'ELEC-002', name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', weight: 0.232, price: 1299, minStock: 5, maxStock: 40, barcode: '887276707471' },
  { sku: 'ELEC-003', name: 'MacBook Air M3 13"', category: 'Electronics', weight: 1.24, price: 1099, minStock: 3, maxStock: 25, barcode: '195949112737' },
  { sku: 'ELEC-004', name: 'Dell XPS 13 Laptop', category: 'Electronics', weight: 1.19, price: 999, minStock: 3, maxStock: 20, barcode: '884116404446' },
  { sku: 'ELEC-005', name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', weight: 0.25, price: 399, minStock: 10, maxStock: 60, barcode: '027242920262' },
  { sku: 'ELEC-006', name: 'iPad Pro 12.9" M2', category: 'Electronics', weight: 0.682, price: 1099, minStock: 5, maxStock: 30, barcode: '194253436447' },
  { sku: 'ELEC-007', name: 'Nintendo Switch OLED', category: 'Electronics', weight: 0.42, price: 349, minStock: 8, maxStock: 50, barcode: '045496596309' },
  { sku: 'ELEC-008', name: 'LG 55" OLED TV', category: 'Electronics', weight: 18.9, price: 1499, minStock: 2, maxStock: 15, barcode: '195174024447' },

  // Food & Beverages
  { sku: 'FOOD-001', name: 'Organic Basmati Rice 5kg', category: 'Food', weight: 5.0, price: 12.99, minStock: 50, maxStock: 500, barcode: '8901030895234', temperature: 'AMBIENT' },
  { sku: 'FOOD-002', name: 'Premium Olive Oil 1L', category: 'Food', weight: 0.92, price: 24.99, minStock: 30, maxStock: 200, barcode: '8410436249847', temperature: 'AMBIENT' },
  { sku: 'FOOD-003', name: 'Organic Whole Milk 1L', category: 'Food', weight: 1.03, price: 4.49, minStock: 100, maxStock: 300, barcode: '3560070734016', temperature: 'REFRIGERATED' },
  { sku: 'FOOD-004', name: 'Free Range Eggs 12pk', category: 'Food', weight: 0.75, price: 6.99, minStock: 80, maxStock: 400, barcode: '9310072001234', temperature: 'REFRIGERATED' },
  { sku: 'FOOD-005', name: 'Frozen Blueberries 500g', category: 'Food', weight: 0.5, price: 8.99, minStock: 60, maxStock: 300, barcode: '8901030895567', temperature: 'FROZEN' },
  { sku: 'FOOD-006', name: 'Artisan Sourdough Bread', category: 'Food', weight: 0.8, price: 5.99, minStock: 40, maxStock: 150, barcode: '9310072002345', temperature: 'AMBIENT' },
  { sku: 'FOOD-007', name: 'Himalayan Pink Salt 1kg', category: 'Food', weight: 1.0, price: 9.99, minStock: 25, maxStock: 100, barcode: '8901030896789', temperature: 'AMBIENT' },
  { sku: 'FOOD-008', name: 'Organic Honey 500g', category: 'Food', weight: 0.7, price: 15.99, minStock: 35, maxStock: 150, barcode: '9310072003456', temperature: 'AMBIENT' },

  // Automotive
  { sku: 'AUTO-001', name: 'Mobil 1 Synthetic Oil 5L', category: 'Automotive', weight: 4.5, price: 49.99, minStock: 20, maxStock: 100, barcode: '071924078239', hazardLevel: 'MEDIUM' },
  { sku: 'AUTO-002', name: 'Bosch Car Battery 12V 70Ah', category: 'Automotive', weight: 18.2, price: 189.99, minStock: 10, maxStock: 50, barcode: '4047024555556', hazardLevel: 'MEDIUM' },
  { sku: 'AUTO-003', name: 'Michelin Tire 225/60R16', category: 'Automotive', weight: 12.5, price: 159.99, minStock: 15, maxStock: 80, barcode: '3528700123456' },
  { sku: 'AUTO-004', name: 'Castrol GTX Oil Filter', category: 'Automotive', weight: 0.8, price: 12.99, minStock: 50, maxStock: 200, barcode: '071924078567' },
  { sku: 'AUTO-005', name: 'Brake Pads Front Set', category: 'Automotive', weight: 2.1, price: 89.99, minStock: 25, maxStock: 100, barcode: '4047024556789' },

  // Home & Garden
  { sku: 'HOME-001', name: 'Dyson V15 Vacuum Cleaner', category: 'Home & Garden', weight: 3.1, price: 749.99, minStock: 5, maxStock: 25, barcode: '885609015234' },
  { sku: 'HOME-002', name: 'KitchenAid Stand Mixer', category: 'Home & Garden', weight: 10.9, price: 449.99, minStock: 8, maxStock: 30, barcode: '883049456789' },
  { sku: 'HOME-003', name: 'Nespresso Coffee Machine', category: 'Home & Garden', weight: 4.2, price: 199.99, minStock: 12, maxStock: 50, barcode: '7630039567890' },
  { sku: 'HOME-004', name: 'Philips Air Purifier', category: 'Home & Garden', weight: 7.8, price: 299.99, minStock: 6, maxStock: 25, barcode: '871086234567' },
  { sku: 'HOME-005', name: 'Weber Gas Grill', category: 'Home & Garden', weight: 52.6, price: 599.99, minStock: 3, maxStock: 15, barcode: '077924123456' },

  // Health & Beauty
  { sku: 'HLTH-001', name: 'Vitamin D3 5000IU 120 caps', category: 'Health & Beauty', weight: 0.15, price: 19.99, minStock: 40, maxStock: 200, barcode: '033674123456' },
  { sku: 'HLTH-002', name: 'Omega-3 Fish Oil 180 caps', category: 'Health & Beauty', weight: 0.25, price: 29.99, minStock: 35, maxStock: 150, barcode: '033674234567' },
  { sku: 'HLTH-003', name: 'Organic Protein Powder 2kg', category: 'Health & Beauty', weight: 2.2, price: 59.99, minStock: 20, maxStock: 80, barcode: '033674345678' },
  { sku: 'HLTH-004', name: 'Moisturizing Face Cream 50ml', category: 'Health & Beauty', weight: 0.08, price: 24.99, minStock: 60, maxStock: 300, barcode: '3605971234567' },
  { sku: 'HLTH-005', name: 'Electric Toothbrush', category: 'Health & Beauty', weight: 0.3, price: 89.99, minStock: 15, maxStock: 60, barcode: '069055123456' },

  // Sports & Outdoors
  { sku: 'SPRT-001', name: 'Nike Air Max Sneakers', category: 'Sports & Outdoors', weight: 0.8, price: 129.99, minStock: 25, maxStock: 100, barcode: '194501234567' },
  { sku: 'SPRT-002', name: 'Yoga Mat Premium 6mm', category: 'Sports & Outdoors', weight: 1.2, price: 49.99, minStock: 30, maxStock: 120, barcode: '883212345678' },
  { sku: 'SPRT-003', name: 'Dumbbell Set 20kg', category: 'Sports & Outdoors', weight: 20.0, price: 149.99, minStock: 10, maxStock: 40, barcode: '883223456789' },
  { sku: 'SPRT-004', name: 'Camping Tent 4-Person', category: 'Sports & Outdoors', weight: 4.5, price: 199.99, minStock: 8, maxStock: 30, barcode: '883234567890' },
  { sku: 'SPRT-005', name: 'Mountain Bike 27.5"', category: 'Sports & Outdoors', weight: 13.2, price: 899.99, minStock: 5, maxStock: 20, barcode: '883245678901' },

  // Books & Media
  { sku: 'BOOK-001', name: 'The Psychology of Money', category: 'Books & Media', weight: 0.3, price: 16.99, minStock: 20, maxStock: 100, barcode: '9780857197689' },
  { sku: 'BOOK-002', name: 'Atomic Habits Hardcover', category: 'Books & Media', weight: 0.45, price: 18.99, minStock: 25, maxStock: 120, barcode: '9780735211292' },
  { sku: 'BOOK-003', name: 'The 7 Habits of Highly Effective People', category: 'Books & Media', weight: 0.4, price: 15.99, minStock: 30, maxStock: 150, barcode: '9781982137274' },

  // Toys & Games
  { sku: 'TOYS-001', name: 'LEGO Creator Expert Set', category: 'Toys & Games', weight: 2.1, price: 179.99, minStock: 10, maxStock: 50, barcode: '673419123456' },
  { sku: 'TOYS-002', name: 'Monopoly Classic Board Game', category: 'Toys & Games', weight: 1.2, price: 29.99, minStock: 20, maxStock: 80, barcode: '630509234567' },
  { sku: 'TOYS-003', name: 'Remote Control Drone', category: 'Toys & Games', weight: 0.8, price: 149.99, minStock: 12, maxStock: 40, barcode: '630509345678' },

  // Office Supplies
  { sku: 'OFFC-001', name: 'Ergonomic Office Chair', category: 'Office Supplies', weight: 18.5, price: 299.99, minStock: 5, maxStock: 25, barcode: '841159123456' },
  { sku: 'OFFC-002', name: 'Standing Desk Converter', category: 'Office Supplies', weight: 12.3, price: 199.99, minStock: 8, maxStock: 30, barcode: '841159234567' },
  { sku: 'OFFC-003', name: 'Wireless Keyboard & Mouse', category: 'Office Supplies', weight: 0.9, price: 79.99, minStock: 25, maxStock: 100, barcode: '097855123456' },
  { sku: 'OFFC-004', name: 'LED Desk Lamp', category: 'Office Supplies', weight: 1.8, price: 59.99, minStock: 15, maxStock: 60, barcode: '097855234567' },

  // Pet Supplies
  { sku: 'PETS-001', name: 'Premium Dog Food 15kg', category: 'Pet Supplies', weight: 15.0, price: 89.99, minStock: 20, maxStock: 80, barcode: '631234567890' },
  { sku: 'PETS-002', name: 'Cat Litter Clumping 10kg', category: 'Pet Supplies', weight: 10.0, price: 24.99, minStock: 30, maxStock: 120, barcode: '631234678901' },
  { sku: 'PETS-003', name: 'Dog Leash Retractable', category: 'Pet Supplies', weight: 0.4, price: 19.99, minStock: 40, maxStock: 150, barcode: '631234789012' },
];

const suppliers = [
  { code: 'SUP-TECH', name: 'TechWorld Electronics', contact: '+1-555-0101', email: 'orders@techworld.com' },
  { code: 'SUP-FOOD', name: 'Fresh Foods Distributor', contact: '+1-555-0102', email: 'supply@freshfoods.com' },
  { code: 'SUP-AUTO', name: 'AutoParts Direct', contact: '+1-555-0103', email: 'sales@autoparts.com' },
  { code: 'SUP-HOME', name: 'Home & Garden Supply Co', contact: '+1-555-0104', email: 'orders@homegardens.com' },
  { code: 'SUP-HLTH', name: 'HealthFirst Wholesale', contact: '+1-555-0105', email: 'info@healthfirst.com' },
  { code: 'SUP-SPRT', name: 'SportZone Distribution', contact: '+1-555-0106', email: 'orders@sportzone.com' },
  { code: 'SUP-BOOK', name: 'BookWorld Publishers', contact: '+1-555-0107', email: 'sales@bookworld.com' },
  { code: 'SUP-TOYS', name: 'ToyLand Wholesale', contact: '+1-555-0108', email: 'orders@toyland.com' },
  { code: 'SUP-OFFC', name: 'Office Solutions Inc', contact: '+1-555-0109', email: 'sales@officesolutions.com' },
  { code: 'SUP-PETS', name: 'Pet Paradise Supply', contact: '+1-555-0110', email: 'orders@petparadise.com' },
];

async function main() {
  console.log('🌱 Seeding database with real products...');

  // Get or create warehouse
  let warehouse = await prisma.warehouse.findFirst();
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { code: 'WH001', name: 'Main Distribution Center', address: '1234 Industrial Blvd, Commerce City, CO 80022' }
    });
  }

  // Create suppliers
  const createdSuppliers = [];
  for (const supplier of suppliers) {
    const created = await prisma.supplier.upsert({
      where: { code: supplier.code },
      update: {},
      create: supplier
    });
    createdSuppliers.push(created);
  }

  // Create zones if they don't exist
  const zones = await prisma.zone.findMany();
  let createdZones = zones;
  if (zones.length === 0) {
    createdZones = await Promise.all([
      prisma.zone.create({ data: { code: 'AMB', name: 'Ambient Zone', temperature: 'AMBIENT', securityLevel: 'LOW', warehouseId: warehouse.id } }),
      prisma.zone.create({ data: { code: 'REF', name: 'Refrigerated Zone', temperature: 'REFRIGERATED', securityLevel: 'MEDIUM', warehouseId: warehouse.id } }),
      prisma.zone.create({ data: { code: 'FRZ', name: 'Frozen Zone', temperature: 'FROZEN', securityLevel: 'HIGH', warehouseId: warehouse.id } }),
      prisma.zone.create({ data: { code: 'SEC', name: 'Secure Zone', temperature: 'AMBIENT', securityLevel: 'RESTRICTED', warehouseId: warehouse.id } })
    ]);
  }

  // Create items with proper supplier mapping
  const supplierMapping: { [key: string]: number } = {
    'Electronics': 0,
    'Food': 1,
    'Automotive': 2,
    'Home & Garden': 3,
    'Health & Beauty': 4,
    'Sports & Outdoors': 5,
    'Books & Media': 6,
    'Toys & Games': 7,
    'Office Supplies': 8,
    'Pet Supplies': 9
  };

  for (const product of realProducts) {
    const supplierIndex = supplierMapping[product.category] || 0;
    const supplier = createdSuppliers[supplierIndex];

    await prisma.item.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        name: product.name,
        category: product.category,
        weight: product.weight,
        hazardLevel: (product.hazardLevel as any) || 'NONE',
        temperature: (product.temperature as any) || 'AMBIENT',
        minStock: product.minStock,
        maxStock: product.maxStock,
        barcode: product.barcode,
        supplierId: supplier.id
      }
    });
  }

  // Create inventory records for all items
  const allItems = await prisma.item.findMany();
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const currentStock = Math.floor(Math.random() * (item.maxStock! - item.minStock)) + item.minStock;
    
    await prisma.inventory.upsert({
      where: { id: `inv-${item.sku}` },
      update: { quantity: currentStock },
      create: {
        id: `inv-${item.sku}`,
        itemId: item.id,
        location: `${String.fromCharCode(65 + (i % 4))}-${String(Math.floor(i/4) + 1).padStart(2, '0')}-${String((i % 5) + 1).padStart(2, '0')}-${String((i % 3) + 1).padStart(2, '0')}`,
        quantity: currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        lastCounted: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        status: 'ACTIVE'
      }
    });
  }

  // Create some batches for food items
  const foodItems = allItems.filter(item => item.category === 'Food');
  for (const item of foodItems) {
    const batchCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < batchCount; i++) {
      const batchNumber = `${item.sku}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 365) + 1).padStart(3, '0')}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 365) + 30);
      
      await prisma.batch.upsert({
        where: { batchNumber },
        update: {},
        create: {
          batchNumber,
          itemId: item.id,
          quantity: Math.floor(Math.random() * 100) + 50,
          expiryDate,
          status: 'ACTIVE'
        }
      });
    }
  }

  // Create some reorder points for low stock items
  const lowStockItems = allItems.filter(() => Math.random() < 0.3); // 30% chance
  for (const item of lowStockItems) {
    await prisma.reorder.upsert({
      where: { id: `reorder-${item.sku}` },
      update: {},
      create: {
        id: `reorder-${item.sku}`,
        itemId: item.id,
        quantity: Math.floor((item.maxStock! - item.minStock) * 0.7) + item.minStock,
        priority: Math.random() < 0.2 ? 'HIGH' : Math.random() < 0.5 ? 'MEDIUM' : 'LOW',
        status: 'PENDING',
        requestedAt: new Date(),
        notes: `Automatic reorder triggered for ${item.name}`
      }
    });
  }

  console.log('✅ Database seeded successfully with real products!');
  console.log(`   Products: ${realProducts.length}`);
  console.log(`   Suppliers: ${suppliers.length}`);
  console.log(`   Inventory Records: ${allItems.length}`);
  console.log(`   Food Batches: ${foodItems.length * 2} (avg)`);
  console.log(`   Reorder Points: ${lowStockItems.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });