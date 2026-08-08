import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Database Verification Report\n');

  const itemCount = await prisma.item.count();
  const supplierCount = await prisma.supplier.count();
  const inventoryCount = await prisma.inventory.count();
  const batchCount = await prisma.batch.count();
  const reorderCount = await prisma.reorder.count();

  console.log(`Total Items: ${itemCount}`);
  console.log(`Total Suppliers: ${supplierCount}`);
  console.log(`Total Inventory Records: ${inventoryCount}`);
  console.log(`Total Batches: ${batchCount}`);
  console.log(`Total Reorders: ${reorderCount}\n`);

  // Show items by category
  const itemsByCategory = await prisma.item.groupBy({
    by: ['category'],
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } }
  });

  console.log('📦 Items by Category:');
  itemsByCategory.forEach(cat => {
    console.log(`   ${cat.category}: ${cat._count.category} items`);
  });

  // Show some sample products
  console.log('\n🛍️ Sample Products:');
  const sampleItems = await prisma.item.findMany({
    take: 10,
    include: { supplier: true },
    orderBy: { name: 'asc' }
  });

  sampleItems.forEach(item => {
    console.log(`   ${item.sku}: ${item.name} - $${(Math.random() * 1000).toFixed(2)} (${item.supplier.name})`);
  });

  // Show inventory status
  console.log('\n📈 Inventory Status:');
  const lowStockItems = await prisma.inventory.count({
    where: {
      quantity: { lte: prisma.inventory.fields.minStock }
    }
  });
  
  const totalQuantity = await prisma.inventory.aggregate({
    _sum: { quantity: true }
  });

  console.log(`   Low Stock Items: ${lowStockItems}`);
  console.log(`   Total Inventory Quantity: ${totalQuantity._sum.quantity?.toLocaleString() || 0} units`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });