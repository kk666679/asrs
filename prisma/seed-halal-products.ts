import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const halalManufacturers = [
  {
    name: 'Al-Barakah Foods International',
    arabicName: 'شركة البركة للأغذية الدولية',
    licenseNumber: 'HM-MY-001',
    address: 'Kuala Lumpur Industrial Park, Malaysia',
    country: 'Malaysia',
    contactPerson: 'Ahmad Hassan',
    email: 'ahmad@albarakah.com',
    phone: '+60-3-1234-5678',
    halalCertification: 'JAKIM Certified - Full Halal Manufacturing',
    certificationExpiry: new Date('2025-12-31'),
    complianceScore: 98
  },
  {
    name: 'Crescent Moon Dairy Co.',
    arabicName: 'شركة هلال القمر للألبان',
    licenseNumber: 'HM-UAE-002',
    address: 'Dubai Food City, UAE',
    country: 'UAE',
    contactPerson: 'Fatima Al-Zahra',
    email: 'fatima@crescentdairy.ae',
    phone: '+971-4-567-8901',
    halalCertification: 'Emirates Authority for Standardization - Halal Certified',
    certificationExpiry: new Date('2025-08-15'),
    complianceScore: 96
  },
  {
    name: 'Halal Harvest Organics',
    arabicName: 'حصاد حلال العضوي',
    licenseNumber: 'HM-US-003',
    address: 'Detroit Halal District, Michigan, USA',
    country: 'USA',
    contactPerson: 'Omar Abdullah',
    email: 'omar@halalharvest.com',
    phone: '+1-313-555-0123',
    halalCertification: 'Islamic Society of North America (ISNA) Certified',
    certificationExpiry: new Date('2025-10-20'),
    complianceScore: 94
  },
  {
    name: 'Bismillah Meat Processing',
    arabicName: 'مصنع بسم الله لتجهيز اللحوم',
    licenseNumber: 'HM-AU-004',
    address: 'Melbourne Halal Hub, Victoria, Australia',
    country: 'Australia',
    contactPerson: 'Ibrahim Khan',
    email: 'ibrahim@bismillah.com.au',
    phone: '+61-3-9876-5432',
    halalCertification: 'Australian Halal Food Services - Grade A',
    certificationExpiry: new Date('2025-06-30'),
    complianceScore: 97
  }
];

const halalSuppliers = [
  {
    name: 'Global Halal Distribution',
    arabicName: 'التوزيع الحلال العالمي',
    licenseNumber: 'HS-001',
    address: 'Singapore Halal Trade Center',
    country: 'Singapore',
    contactPerson: 'Aisha Rahman',
    email: 'aisha@globalhalal.sg',
    phone: '+65-6789-0123',
    halalCertification: 'MUIS Singapore Halal Certified',
    certificationExpiry: new Date('2025-11-15'),
    complianceScore: 95
  },
  {
    name: 'Middle East Halal Imports',
    arabicName: 'واردات الشرق الأوسط الحلال',
    licenseNumber: 'HS-002',
    address: 'Jeddah Islamic Port, Saudi Arabia',
    country: 'Saudi Arabia',
    contactPerson: 'Mohammed Al-Rashid',
    email: 'mohammed@mehimports.sa',
    phone: '+966-12-345-6789',
    halalCertification: 'Saudi Food and Drug Authority - Halal Verified',
    certificationExpiry: new Date('2025-09-10'),
    complianceScore: 99
  }
];

const halalCertificationBodies = [
  {
    name: 'JAKIM (Jabatan Kemajuan Islam Malaysia)',
    licenseNumber: 'JAKIM-2024',
    validityPeriodStart: new Date('2024-01-01'),
    validityPeriodEnd: new Date('2026-12-31')
  },
  {
    name: 'Islamic Society of North America (ISNA)',
    licenseNumber: 'ISNA-2024',
    validityPeriodStart: new Date('2024-01-01'),
    validityPeriodEnd: new Date('2025-12-31')
  },
  {
    name: 'Emirates Authority for Standardization',
    licenseNumber: 'EAS-2024',
    validityPeriodStart: new Date('2024-01-01'),
    validityPeriodEnd: new Date('2025-12-31')
  }
];

const halalProducts = [
  // Meat & Poultry
  {
    sku: 'HALAL-MEAT-001',
    name: 'Premium Halal Beef Ribeye Steak',
    arabicName: 'ستيك لحم البقر الحلال الممتاز',
    description: 'Hand-slaughtered premium beef ribeye, aged 21 days',
    category: 'MEAT_POULTRY',
    subcategory: 'Beef',
    brand: 'Al-Barakah Premium',
    countryOfOrigin: 'Australia',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'HALAL_ZABIHAH',
    storageRequirement: 'TEMPERATURE_CONTROLLED',
    segregationRequired: true,
    crossContamRisk: 'Low - Dedicated halal facility',
    ingredients: JSON.stringify(['100% Halal Beef']),
    allergens: JSON.stringify([]),
    weight: 0.5,
    dimensions: JSON.stringify({ length: 15, width: 10, height: 3 }),
    batchTracking: true,
    shelfLife: 14,
    storageTemp: '-2°C to 2°C',
    handlingInstructions: 'Keep refrigerated, use within 14 days of opening'
  },
  {
    sku: 'HALAL-MEAT-002',
    name: 'Organic Halal Chicken Breast',
    arabicName: 'صدر الدجاج الحلال العضوي',
    description: 'Free-range organic chicken breast, hormone-free',
    category: 'MEAT_POULTRY',
    subcategory: 'Chicken',
    brand: 'Crescent Organic',
    countryOfOrigin: 'Malaysia',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'HAND_SLAUGHTER',
    storageRequirement: 'TEMPERATURE_CONTROLLED',
    segregationRequired: true,
    crossContamRisk: 'None - Dedicated organic halal farm',
    ingredients: JSON.stringify(['100% Organic Halal Chicken']),
    allergens: JSON.stringify([]),
    weight: 1.0,
    dimensions: JSON.stringify({ length: 20, width: 15, height: 4 }),
    batchTracking: true,
    shelfLife: 10,
    storageTemp: '0°C to 4°C',
    handlingInstructions: 'Keep refrigerated, cook thoroughly before consumption'
  },
  {
    sku: 'HALAL-MEAT-003',
    name: 'Halal Lamb Shoulder',
    arabicName: 'كتف الخروف الحلال',
    description: 'Grass-fed halal lamb shoulder, perfect for slow cooking',
    category: 'MEAT_POULTRY',
    subcategory: 'Lamb',
    brand: 'Bismillah Meats',
    countryOfOrigin: 'New Zealand',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'HALAL_ZABIHAH',
    storageRequirement: 'TEMPERATURE_CONTROLLED',
    segregationRequired: true,
    crossContamRisk: 'None - Dedicated halal processing',
    ingredients: JSON.stringify(['100% Halal Lamb']),
    allergens: JSON.stringify([]),
    weight: 2.0,
    dimensions: JSON.stringify({ length: 25, width: 20, height: 8 }),
    batchTracking: true,
    shelfLife: 21,
    storageTemp: '-2°C to 2°C',
    handlingInstructions: 'Keep refrigerated, suitable for freezing'
  },

  // Dairy Products
  {
    sku: 'HALAL-DAIRY-001',
    name: 'Halal Certified Whole Milk',
    arabicName: 'حليب كامل الدسم حلال معتمد',
    description: 'Fresh whole milk from halal-certified dairy farms',
    category: 'DAIRY',
    subcategory: 'Milk',
    brand: 'Crescent Moon Dairy',
    countryOfOrigin: 'UAE',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'NOT_APPLICABLE',
    storageRequirement: 'TEMPERATURE_CONTROLLED',
    segregationRequired: false,
    crossContamRisk: 'None - Vegetarian product',
    ingredients: JSON.stringify(['Pasteurized Whole Milk', 'Vitamin D3 (Halal Source)']),
    allergens: JSON.stringify(['Milk']),
    nutritionalInfo: JSON.stringify({
      calories: 150,
      protein: '8g',
      fat: '8g',
      carbs: '12g',
      calcium: '280mg'
    }),
    weight: 1.0,
    dimensions: JSON.stringify({ length: 10, width: 6, height: 20 }),
    batchTracking: true,
    shelfLife: 7,
    storageTemp: '2°C to 6°C',
    handlingInstructions: 'Keep refrigerated, shake well before use'
  },
  {
    sku: 'HALAL-DAIRY-002',
    name: 'Halal Mozzarella Cheese',
    arabicName: 'جبنة موتزاريلا حلال',
    description: 'Fresh mozzarella made with halal rennet',
    category: 'DAIRY',
    subcategory: 'Cheese',
    brand: 'Al-Barakah Dairy',
    countryOfOrigin: 'Turkey',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'NOT_APPLICABLE',
    storageRequirement: 'TEMPERATURE_CONTROLLED',
    segregationRequired: false,
    crossContamRisk: 'None - Halal rennet used',
    ingredients: JSON.stringify(['Pasteurized Milk', 'Halal Rennet', 'Salt', 'Citric Acid']),
    allergens: JSON.stringify(['Milk']),
    weight: 0.25,
    dimensions: JSON.stringify({ length: 12, width: 8, height: 3 }),
    batchTracking: true,
    shelfLife: 14,
    storageTemp: '2°C to 8°C',
    handlingInstructions: 'Keep refrigerated, best consumed fresh'
  },

  // Beverages
  {
    sku: 'HALAL-BEV-001',
    name: 'Halal Energy Drink - Tropical',
    arabicName: 'مشروب الطاقة الحلال - استوائي',
    description: 'Natural energy drink with halal-certified ingredients',
    category: 'BEVERAGES',
    subcategory: 'Energy Drinks',
    brand: 'Halal Power',
    countryOfOrigin: 'Indonesia',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'NOT_APPLICABLE',
    storageRequirement: 'STANDARD',
    segregationRequired: false,
    crossContamRisk: 'None - Plant-based ingredients',
    ingredients: JSON.stringify(['Carbonated Water', 'Natural Cane Sugar', 'Halal Taurine', 'Caffeine', 'Natural Tropical Flavors', 'Vitamins B3, B6, B12']),
    allergens: JSON.stringify([]),
    nutritionalInfo: JSON.stringify({
      calories: 110,
      sugar: '27g',
      caffeine: '80mg',
      taurine: '1000mg'
    }),
    weight: 0.25,
    dimensions: JSON.stringify({ length: 6, width: 6, height: 12 }),
    batchTracking: true,
    shelfLife: 365,
    storageTemp: 'Room temperature',
    handlingInstructions: 'Store in cool, dry place'
  },

  // Snacks
  {
    sku: 'HALAL-SNACK-001',
    name: 'Halal Beef Jerky - Original',
    arabicName: 'لحم البقر المجفف الحلال - النكهة الأصلية',
    description: 'Premium halal beef jerky with traditional spices',
    category: 'SNACKS',
    subcategory: 'Meat Snacks',
    brand: 'Desert Nomad',
    countryOfOrigin: 'USA',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'HALAL_ZABIHAH',
    storageRequirement: 'STANDARD',
    segregationRequired: true,
    crossContamRisk: 'Low - Dedicated halal facility',
    ingredients: JSON.stringify(['Halal Beef', 'Sea Salt', 'Black Pepper', 'Garlic Powder', 'Onion Powder', 'Natural Smoke Flavor']),
    allergens: JSON.stringify([]),
    weight: 0.085,
    dimensions: JSON.stringify({ length: 15, width: 10, height: 1 }),
    batchTracking: true,
    shelfLife: 365,
    storageTemp: 'Room temperature',
    handlingInstructions: 'Store in cool, dry place, reseal after opening'
  },
  {
    sku: 'HALAL-SNACK-002',
    name: 'Halal Chicken Nuggets - Frozen',
    arabicName: 'قطع الدجاج الحلال المجمدة',
    description: 'Crispy halal chicken nuggets, ready to cook',
    category: 'FROZEN_FOODS',
    subcategory: 'Chicken Products',
    brand: 'Crescent Frozen',
    countryOfOrigin: 'Canada',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'HALAL_ZABIHAH',
    storageRequirement: 'TEMPERATURE_CONTROLLED',
    segregationRequired: true,
    crossContamRisk: 'None - Dedicated halal line',
    ingredients: JSON.stringify(['Halal Chicken Breast', 'Wheat Flour', 'Vegetable Oil', 'Salt', 'Spices', 'Baking Powder']),
    allergens: JSON.stringify(['Wheat', 'Gluten']),
    weight: 0.5,
    dimensions: JSON.stringify({ length: 20, width: 15, height: 5 }),
    batchTracking: true,
    shelfLife: 365,
    storageTemp: '-18°C or below',
    handlingInstructions: 'Keep frozen, cook from frozen, do not refreeze'
  },

  // Canned Goods
  {
    sku: 'HALAL-CAN-001',
    name: 'Halal Beef Stew - Ready to Eat',
    arabicName: 'يخنة اللحم الحلال - جاهزة للأكل',
    description: 'Traditional beef stew with vegetables, fully cooked',
    category: 'CANNED_GOODS',
    subcategory: 'Ready Meals',
    brand: 'Al-Barakah Kitchen',
    countryOfOrigin: 'Malaysia',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'HALAL_ZABIHAH',
    storageRequirement: 'STANDARD',
    segregationRequired: false,
    crossContamRisk: 'None - Sealed product',
    ingredients: JSON.stringify(['Halal Beef', 'Potatoes', 'Carrots', 'Onions', 'Tomato Paste', 'Beef Broth', 'Spices', 'Salt']),
    allergens: JSON.stringify([]),
    weight: 0.4,
    dimensions: JSON.stringify({ length: 10, width: 10, height: 8 }),
    batchTracking: true,
    shelfLife: 1095,
    storageTemp: 'Room temperature',
    handlingInstructions: 'Store in cool, dry place, refrigerate after opening'
  },

  // Spices & Seasonings
  {
    sku: 'HALAL-SPICE-001',
    name: 'Halal Biryani Masala Blend',
    arabicName: 'خلطة بهارات البرياني الحلال',
    description: 'Authentic biryani spice blend, halal certified',
    category: 'SPICES_SEASONINGS',
    subcategory: 'Spice Blends',
    brand: 'Spice Bazaar',
    countryOfOrigin: 'India',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'NOT_APPLICABLE',
    storageRequirement: 'STANDARD',
    segregationRequired: false,
    crossContamRisk: 'None - Plant-based spices',
    ingredients: JSON.stringify(['Cumin', 'Coriander', 'Cardamom', 'Cinnamon', 'Cloves', 'Bay Leaves', 'Star Anise', 'Nutmeg']),
    allergens: JSON.stringify([]),
    weight: 0.1,
    dimensions: JSON.stringify({ length: 8, width: 5, height: 12 }),
    batchTracking: true,
    shelfLife: 730,
    storageTemp: 'Room temperature',
    handlingInstructions: 'Store in airtight container, away from light and moisture'
  },

  // Bakery
  {
    sku: 'HALAL-BAKERY-001',
    name: 'Halal Croissants - Butter',
    arabicName: 'كرواسون حلال بالزبدة',
    description: 'Flaky butter croissants made with halal ingredients',
    category: 'BAKERY',
    subcategory: 'Pastries',
    brand: 'Crescent Bakery',
    countryOfOrigin: 'France',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'NOT_APPLICABLE',
    storageRequirement: 'STANDARD',
    segregationRequired: false,
    crossContamRisk: 'None - Halal butter used',
    ingredients: JSON.stringify(['Wheat Flour', 'Halal Butter', 'Water', 'Sugar', 'Salt', 'Yeast', 'Eggs']),
    allergens: JSON.stringify(['Wheat', 'Gluten', 'Eggs', 'Milk']),
    weight: 0.06,
    dimensions: JSON.stringify({ length: 12, width: 8, height: 6 }),
    batchTracking: true,
    shelfLife: 3,
    storageTemp: 'Room temperature',
    handlingInstructions: 'Best consumed fresh, can be frozen for up to 1 month'
  },

  // Confectionery
  {
    sku: 'HALAL-CANDY-001',
    name: 'Halal Gummy Bears',
    arabicName: 'دببة الجيلي الحلال',
    description: 'Fruit-flavored gummy bears made with halal gelatin',
    category: 'CONFECTIONERY',
    subcategory: 'Gummy Candy',
    brand: 'Sweet Crescent',
    countryOfOrigin: 'Germany',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'HALAL_ZABIHAH',
    storageRequirement: 'STANDARD',
    segregationRequired: false,
    crossContamRisk: 'None - Halal gelatin used',
    ingredients: JSON.stringify(['Sugar', 'Halal Beef Gelatin', 'Citric Acid', 'Natural Fruit Flavors', 'Natural Colors']),
    allergens: JSON.stringify([]),
    weight: 0.2,
    dimensions: JSON.stringify({ length: 15, width: 10, height: 3 }),
    batchTracking: true,
    shelfLife: 365,
    storageTemp: 'Room temperature',
    handlingInstructions: 'Store in cool, dry place, away from direct sunlight'
  },

  // Personal Care
  {
    sku: 'HALAL-CARE-001',
    name: 'Halal Moisturizing Soap',
    arabicName: 'صابون مرطب حلال',
    description: 'Natural moisturizing soap with halal ingredients',
    category: 'PERSONAL_CARE',
    subcategory: 'Bath & Body',
    brand: 'Pure Essence',
    countryOfOrigin: 'Morocco',
    halalStatus: 'CERTIFIED',
    slaughterMethod: 'NOT_APPLICABLE',
    storageRequirement: 'STANDARD',
    segregationRequired: false,
    crossContamRisk: 'None - Plant-based ingredients',
    ingredients: JSON.stringify(['Olive Oil', 'Coconut Oil', 'Palm Oil', 'Sodium Hydroxide', 'Argan Oil', 'Essential Oils']),
    allergens: JSON.stringify([]),
    weight: 0.125,
    dimensions: JSON.stringify({ length: 8, width: 5, height: 3 }),
    batchTracking: true,
    shelfLife: 1095,
    storageTemp: 'Room temperature',
    handlingInstructions: 'Keep dry between uses, store in cool place'
  }
];

async function main() {
  console.log('🕌 Seeding database with comprehensive halal products...');

  // Create Halal Certification Bodies
  console.log('📋 Creating halal certification bodies...');
  const createdCertBodies = [];
  for (const certBody of halalCertificationBodies) {
    const created = await prisma.halalCertificationBody.upsert({
      where: { licenseNumber: certBody.licenseNumber },
      update: {},
      create: certBody
    });
    createdCertBodies.push(created);
  }

  // Create Halal Manufacturers
  console.log('🏭 Creating halal manufacturers...');
  const createdManufacturers = [];
  for (const manufacturer of halalManufacturers) {
    const created = await prisma.halalManufacturer.upsert({
      where: { licenseNumber: manufacturer.licenseNumber },
      update: {},
      create: manufacturer
    });
    createdManufacturers.push(created);
  }

  // Create Halal Suppliers
  console.log('🚚 Creating halal suppliers...');
  const createdSuppliers = [];
  for (const supplier of halalSuppliers) {
    const created = await prisma.halalSupplier.upsert({
      where: { licenseNumber: supplier.licenseNumber },
      update: {},
      create: supplier
    });
    createdSuppliers.push(created);
  }

  // Create Halal Products
  console.log('🥘 Creating halal products...');
  const createdProducts = [];
  for (let i = 0; i < halalProducts.length; i++) {
    const product = halalProducts[i];
    const manufacturerIndex = i % createdManufacturers.length;
    const supplierIndex = i % createdSuppliers.length;
    const certBodyIndex = i % createdCertBodies.length;

    const created = await prisma.halalProduct.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        name: product.name,
        arabicName: product.arabicName,
        description: product.description,
        category: product.category as any, // Cast to enum
        subcategory: product.subcategory,
        brand: product.brand,
        countryOfOrigin: product.countryOfOrigin,
        halalStatus: product.halalStatus as any,
        slaughterMethod: product.slaughterMethod as any,
        storageRequirement: product.storageRequirement as any,
        segregationRequired: product.segregationRequired,
        crossContamRisk: product.crossContamRisk,
        ingredients: product.ingredients,
        allergens: product.allergens,
        nutritionalInfo: product.nutritionalInfo,
        weight: product.weight,
        dimensions: product.dimensions,
        batchTracking: product.batchTracking,
        shelfLife: product.shelfLife,
        storageTemp: product.storageTemp,
        handlingInstructions: product.handlingInstructions,
        manufacturerId: createdManufacturers[manufacturerIndex].id,
        supplierId: createdSuppliers[supplierIndex].id,
        certificationBodyId: createdCertBodies[certBodyIndex].id,
        certificationNumber: `CERT-${product.sku}-2024`,
        certificationDate: new Date('2024-01-15'),
        expiryDate: new Date('2025-01-15'),
        barcode: `${Date.now()}${i.toString().padStart(3, '0')}`,
        qrCode: `QR-${product.sku}`,
        complianceNotes: 'Fully compliant with international halal standards',
        auditTrail: JSON.stringify([
          {
            date: '2024-01-15',
            action: 'CERTIFICATION_ISSUED',
            details: 'Initial halal certification granted'
          }
        ])
      }
    });
    createdProducts.push(created);
  }

  // Create Halal Inventory Records
  console.log('📦 Creating halal inventory records...');
  for (let i = 0; i < createdProducts.length; i++) {
    const product = createdProducts[i];
    const quantity = Math.floor(Math.random() * 500) + 100;
    const batchNumber = `BATCH-${product.sku}-${new Date().getFullYear()}-${String(i + 1).padStart(3, '0')}-${Date.now()}-${i}`;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (product.shelfLife || 365));

    await prisma.halalInventory.create({
      data: {
        productId: product.id,
        location: `HALAL-ZONE-${String.fromCharCode(65 + (i % 3))}-${String(Math.floor(i/3) + 1).padStart(2, '0')}`,
        zone: 'HALAL_SEGREGATED',
        quantity,
        batchNumber,
        expiryDate,
        certificationStatus: 'CERTIFIED',
        segregationCompliant: true,
        temperatureLog: JSON.stringify([
          { timestamp: new Date().toISOString(), temperature: 22.5, unit: 'C' }
        ]),
        lastInspection: new Date()
      }
    });
  }

  // Create Halal Batches
  console.log('🏷️ Creating halal batches...');
  for (let i = 0; i < createdProducts.length; i++) {
    const product = createdProducts[i];
    const batchNumber = `BATCH-${product.sku}-${new Date().getFullYear()}-${String(i + 1).padStart(3, '0')}-${Date.now()}-${i}`;
    
    const productionDate = new Date();
    productionDate.setDate(productionDate.getDate() - Math.floor(Math.random() * 30));
    
    const expiryDate = new Date(productionDate);
    expiryDate.setDate(expiryDate.getDate() + (product.shelfLife || 365));

    await prisma.halalBatch.create({
      data: {
        productId: product.id,
        batchNumber,
        productionDate,
        expiryDate,
        quantity: Math.floor(Math.random() * 1000) + 500,
        slaughterDate: product.category === 'MEAT_POULTRY' ? productionDate : null,
        slaughterLocation: product.category === 'MEAT_POULTRY' ? 'Certified Halal Slaughterhouse' : null,
        halalSupervisor: product.category === 'MEAT_POULTRY' ? 'Sheikh Abdullah Al-Halal' : null,
        certificationRef: `CERT-${product.sku}-2024`,
        qualityGrade: 'Grade A',
        testResults: JSON.stringify({
          microbiological: 'PASS',
          chemical: 'PASS',
          physical: 'PASS',
          halal_compliance: 'CERTIFIED'
        }),
        traceabilityCode: `TRACE-${batchNumber}-${Date.now()}-${i}`,
        blockchainRecord: `0x${Math.random().toString(16).substr(2, 40)}`
      }
    });
  }

  // Create Audit Logs
  console.log('📋 Creating audit logs...');
  for (const product of createdProducts) {
    await prisma.halalAuditLog.create({
      data: {
        productId: product.id,
        action: 'PRODUCT_CREATED',
        details: JSON.stringify({
          sku: product.sku,
          name: product.name,
          certification_status: 'CERTIFIED',
          created_by: 'SYSTEM_SEED'
        }),
        timestamp: new Date(),
        location: 'WAREHOUSE_MAIN'
      }
    });
  }

  // Create Sample Inspections
  console.log('🔍 Creating sample inspections...');
  for (let i = 0; i < Math.min(5, createdProducts.length); i++) {
    const product = createdProducts[i];
    await prisma.halalInspection.create({
      data: {
        productId: product.id,
        inspectorName: 'Dr. Ahmad Hassan - Certified Halal Inspector',
        inspectionDate: new Date(),
        inspectionType: 'ROUTINE',
        result: 'PASS',
        findings: JSON.stringify({
          certification_valid: true,
          segregation_maintained: true,
          labeling_compliant: true,
          storage_appropriate: true,
          documentation_complete: true
        }),
        correctiveActions: null,
        certificationImpact: 'NONE',
        blockchainRecord: `0x${Math.random().toString(16).substr(2, 40)}`
      }
    });
  }

  console.log('✅ Halal products database seeded successfully!');
  console.log(`   Certification Bodies: ${createdCertBodies.length}`);
  console.log(`   Manufacturers: ${createdManufacturers.length}`);
  console.log(`   Suppliers: ${createdSuppliers.length}`);
  console.log(`   Products: ${createdProducts.length}`);
  console.log(`   Inventory Records: ${createdProducts.length}`);
  console.log(`   Batches: ${createdProducts.length}`);
  console.log(`   Audit Logs: ${createdProducts.length}`);
  console.log(`   Inspections: ${Math.min(5, createdProducts.length)}`);
  
  console.log('\n🕌 Halal Product Categories:');
  const categories = [...new Set(halalProducts.map(p => p.category))];
  categories.forEach(cat => {
    const count = halalProducts.filter(p => p.category === cat).length;
    console.log(`   ${cat}: ${count} products`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Halal products seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });