import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyHalalProducts() {
  console.log('🕌 Verifying Halal Products Database...\n');

  // Get all halal products
  const products = await prisma.halalProduct.findMany({
    include: {
      manufacturer: true,
      supplier: true,
      certificationBody: true,
      inventoryItems: true,
      batches: true
    }
  });

  console.log(`📊 Total Halal Products: ${products.length}\n`);

  // Group by category
  const categories = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Display products by category
  Object.entries(categories).forEach(([category, categoryProducts]) => {
    console.log(`🏷️  ${category.replace('_', ' ')} (${categoryProducts.length} products):`);
    categoryProducts.forEach(product => {
      console.log(`   • ${product.name} (${product.sku})`);
      console.log(`     Arabic: ${product.arabicName || 'N/A'}`);
      console.log(`     Status: ${product.halalStatus}`);
      console.log(`     Manufacturer: ${product.manufacturer.name}`);
      console.log(`     Certification: ${product.certificationBody?.name || 'N/A'}`);
      console.log(`     Inventory: ${product.inventoryItems.length} locations`);
      console.log(`     Batches: ${product.batches.length} batches`);
      console.log('');
    });
  });

  // Summary statistics
  const stats = {
    totalProducts: products.length,
    certifiedProducts: products.filter(p => p.halalStatus === 'CERTIFIED').length,
    segregationRequired: products.filter(p => p.segregationRequired).length,
    meatProducts: products.filter(p => p.category === 'MEAT_POULTRY').length,
    totalInventoryLocations: products.reduce((sum, p) => sum + p.inventoryItems.length, 0),
    totalBatches: products.reduce((sum, p) => sum + p.batches.length, 0)
  };

  console.log('📈 Summary Statistics:');
  console.log(`   Total Products: ${stats.totalProducts}`);
  console.log(`   Certified Products: ${stats.certifiedProducts}`);
  console.log(`   Requiring Segregation: ${stats.segregationRequired}`);
  console.log(`   Meat/Poultry Products: ${stats.meatProducts}`);
  console.log(`   Inventory Locations: ${stats.totalInventoryLocations}`);
  console.log(`   Total Batches: ${stats.totalBatches}`);

  // Get certification bodies
  const certBodies = await prisma.halalCertificationBody.findMany();
  console.log(`\n🏛️  Certification Bodies: ${certBodies.length}`);
  certBodies.forEach(body => {
    console.log(`   • ${body.name} (${body.licenseNumber})`);
  });

  // Get manufacturers
  const manufacturers = await prisma.halalManufacturer.findMany();
  console.log(`\n🏭 Manufacturers: ${manufacturers.length}`);
  manufacturers.forEach(mfg => {
    console.log(`   • ${mfg.name} (${mfg.country})`);
    console.log(`     Compliance Score: ${mfg.complianceScore}%`);
  });

  // Get suppliers
  const suppliers = await prisma.halalSupplier.findMany();
  console.log(`\n🚚 Suppliers: ${suppliers.length}`);
  suppliers.forEach(sup => {
    console.log(`   • ${sup.name} (${sup.country})`);
    console.log(`     Compliance Score: ${sup.complianceScore}%`);
  });

  console.log('\n✅ Halal products verification complete!');
}

verifyHalalProducts()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });