export const generateHalalMockData = () => {
  const regions = ['MIDDLE_EAST', 'SOUTHEAST_ASIA', 'EUROPE', 'NORTH_AMERICA'];
  const categories = ['MEAT', 'POULTRY', 'DAIRY', 'BEVERAGES', 'SNACKS', 'COSMETICS'];
  
  const certificationBodies = [
    { name: 'JAKIM', country: 'Malaysia', performance: 92 },
    { name: 'MUI', country: 'Indonesia', performance: 88 },
    { name: 'ESMA', country: 'UAE', performance: 95 },
    { name: 'HFA', country: 'Australia', performance: 90 },
    { name: 'IFANCA', country: 'USA', performance: 87 }
  ];

  const manufacturers = [
    {
      name: 'Al-Barakah Foods Ltd',
      country: 'Malaysia',
      region: 'SOUTHEAST_ASIA',
      reliabilityScore: 92,
      leadTime: 12,
      renewalRate: 96
    },
    {
      name: 'Crescent Halal Industries',
      country: 'UAE',
      region: 'MIDDLE_EAST',
      reliabilityScore: 88,
      leadTime: 18,
      renewalRate: 94
    }
  ];

  const products = [
    {
      sku: 'HM001',
      name: 'Premium Halal Beef Strips',
      category: 'MEAT',
      sourceCountry: 'Australia',
      complianceScore: 98,
      certified: true,
      marketData: {
        demandIndex: 85,
        marketShare: 12.5,
        growthRate: 15.2,
        seasonalPeak: 'RAMADAN_HIGH'
      }
    },
    {
      sku: 'HB004',
      name: 'Halal Energy Drink',
      category: 'BEVERAGES',
      sourceCountry: 'UAE',
      complianceScore: 89,
      certified: true,
      marketData: {
        demandIndex: 91,
        marketShare: 22.1,
        growthRate: 28.3,
        seasonalPeak: 'RAMADAN_HIGH'
      }
    }
  ];

  const generateSalesData = (product: any, months: number = 12) => {
    const salesData = [];
    const baseRevenue = Math.random() * 100000 + 50000;
    
    for (let i = 0; i < months; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - (months - 1 - i));
      
      let seasonalMultiplier = 1.0;
      const monthNum = month.getMonth();
      
      if (monthNum === 3 || monthNum === 4) seasonalMultiplier = 1.6;
      if (monthNum === 5 || monthNum === 11) seasonalMultiplier = 1.8;
      
      const growthFactor = 1 + (product.marketData.growthRate / 100 / 12);
      const monthlyRevenue = baseRevenue * seasonalMultiplier * growthFactor * (0.8 + Math.random() * 0.4);
      const quantity = Math.round(monthlyRevenue / (20 + Math.random() * 30));
      
      salesData.push({
        month: month.getMonth() + 1,
        year: month.getFullYear(),
        revenue: Math.round(monthlyRevenue),
        quantity,
        unitPrice: Math.round(monthlyRevenue / quantity * 100) / 100,
        region: regions[Math.floor(Math.random() * regions.length)],
        seasonalFactor: seasonalMultiplier > 1.2 ? 'RAMADAN_HIGH' : 'REGULAR'
      });
    }
    
    return salesData;
  };

  const generateRenewalData = () => {
    const renewals = [];
    
    for (let i = 0; i < 10; i++) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 180));
      
      const processingTime = 15 + Math.floor(Math.random() * 30);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      renewals.push({
        certificateId: `CERT-${1000 + i}`,
        productName: products[Math.floor(Math.random() * products.length)].name,
        expiryDate,
        daysUntilExpiry,
        processingTime,
        riskLevel: daysUntilExpiry < processingTime ? 'HIGH' : 
                  daysUntilExpiry < processingTime * 2 ? 'MEDIUM' : 'LOW',
        certificationBody: certificationBodies[Math.floor(Math.random() * certificationBodies.length)].name
      });
    }
    
    return renewals.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  };

  const generateMarketInsights = () => {
    return {
      globalMarketSize: 2.3,
      annualGrowthRate: 6.2,
      topMarkets: [
        { region: 'SOUTHEAST_ASIA', share: 35.2, growth: 8.1 },
        { region: 'MIDDLE_EAST', share: 28.7, growth: 5.9 },
        { region: 'EUROPE', share: 12.1, growth: 4.2 }
      ],
      categoryTrends: [
        { category: 'MEAT', growth: 5.8, marketShare: 32.1 },
        { category: 'BEVERAGES', growth: 12.3, marketShare: 15.2 },
        { category: 'COSMETICS', growth: 15.7, marketShare: 8.9 }
      ]
    };
  };

  return {
    manufacturers,
    products,
    certificationBodies,
    generateSalesData,
    generateRenewalData,
    generateMarketInsights,
    regions,
    categories
  };
};

export const halalEducationalContent = {
  certificationProcess: {
    title: 'Halal Certification Process',
    steps: [
      'Application submission with product details',
      'Documentation review and ingredient analysis',
      'Facility inspection and audit',
      'Product testing and verification',
      'Certificate issuance and ongoing monitoring'
    ],
    timeline: '30-90 days depending on complexity',
    costs: '$500 - $5,000 per product line'
  },
  
  complianceRequirements: {
    title: 'Halal Compliance Requirements',
    categories: {
      ingredients: 'All ingredients must be Halal-certified or naturally Halal',
      processing: 'No cross-contamination with non-Halal products',
      storage: 'Separate storage and handling systems',
      transportation: 'Dedicated or thoroughly cleaned transport'
    }
  },
  
  marketOpportunities: {
    title: 'Global Halal Market Opportunities',
    facts: [
      '1.8 billion Muslim consumers worldwide',
      '$2.3 trillion global Halal market size',
      '6.2% annual growth rate',
      'Growing non-Muslim consumer adoption'
    ]
  }
};