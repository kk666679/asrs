import { HalalProduct, HalalCertification, HalalZone, HalalStats, ComplianceAlert, HalalStatus, StorageZoneType, CertificationStatus } from '../types/halal';

export class HalalInventoryService {
  // Mock data for demonstration
  private static mockProducts: HalalProduct[] = [
    {
      id: '1',
      sku: 'HALAL-001',
      name: 'Halal Chicken Breast',
      description: '100% halal certified chicken breast',
      halalStatus: HalalStatus.CERTIFIED,
      certificationId: 'cert-1',
      supplierId: 'supplier-1',
      storageZone: StorageZoneType.HALAL,
      currentStock: 1500,
      reorderPoint: 200,
      expiryDate: new Date('2024-12-31'),
      batchNumber: 'BATCH-001',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      sku: 'HALAL-002',
      name: 'Halal Beef Patties',
      description: 'Premium halal beef patties',
      halalStatus: HalalStatus.CERTIFIED,
      certificationId: 'cert-2',
      supplierId: 'supplier-1',
      storageZone: StorageZoneType.HALAL,
      currentStock: 800,
      reorderPoint: 100,
      expiryDate: new Date('2024-11-30'),
      batchNumber: 'BATCH-002',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-20')
    }
  ];

  private static mockCertifications: HalalCertification[] = [
    {
      id: 'cert-1',
      certNumber: 'JAKIM-2024-001',
      issuingBody: 'JAKIM',
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2024-12-31'),
      verificationStatus: CertificationStatus.VERIFIED,
      documentUrl: '/certificates/jakim-2024-001.pdf',
      ingredients: ['Chicken', 'Salt', 'Spices'],
      productsCount: 15,
      daysUntilExpiry: 320
    },
    {
      id: 'cert-2',
      certNumber: 'MUI-2024-002',
      issuingBody: 'MUI',
      validFrom: new Date('2024-02-01'),
      validUntil: new Date('2024-08-31'),
      verificationStatus: CertificationStatus.VERIFIED,
      documentUrl: '/certificates/mui-2024-002.pdf',
      ingredients: ['Beef', 'Breadcrumbs', 'Onion'],
      productsCount: 8,
      daysUntilExpiry: 45
    }
  ];

  private static mockZones: HalalZone[] = [
    {
      id: 'zone-1',
      zoneCode: 'HALAL-ZONE-A',
      zoneType: StorageZoneType.HALAL,
      capacity: 10000,
      currentOccupancy: 7500,
      temperatureRange: '2-4°C',
      lastCleaned: new Date('2024-01-15T08:30:00Z'),
      isOperational: true,
      products: this.mockProducts.filter(p => p.storageZone === StorageZoneType.HALAL),
      occupancyPercentage: 75
    },
    {
      id: 'zone-2',
      zoneCode: 'QUARANTINE-ZONE-B',
      zoneType: StorageZoneType.QUARANTINE,
      capacity: 2000,
      currentOccupancy: 150,
      temperatureRange: '2-4°C',
      lastCleaned: new Date('2024-01-20T10:00:00Z'),
      isOperational: true,
      products: [],
      occupancyPercentage: 7.5
    }
  ];

  static async getProducts(filters?: { halalStatus?: HalalStatus; storageZone?: StorageZoneType }): Promise<HalalProduct[]> {
    let products = [...this.mockProducts];
    
    if (filters?.halalStatus) {
      products = products.filter(p => p.halalStatus === filters.halalStatus);
    }
    
    if (filters?.storageZone) {
      products = products.filter(p => p.storageZone === filters.storageZone);
    }
    
    return products;
  }

  static async createProduct(productData: Omit<HalalProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<HalalProduct> {
    const newProduct: HalalProduct = {
      ...productData,
      id: `product-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockProducts.push(newProduct);
    return newProduct;
  }

  static async updateHalalStatus(productId: string, halalStatus: HalalStatus, certificationId?: string): Promise<HalalProduct> {
    const productIndex = this.mockProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    this.mockProducts[productIndex] = {
      ...this.mockProducts[productIndex],
      halalStatus,
      certificationId,
      updatedAt: new Date()
    };
    
    return this.mockProducts[productIndex];
  }

  static async getCertifications(): Promise<HalalCertification[]> {
    return [...this.mockCertifications];
  }

  static async verifyCertification(certId: string): Promise<{ verified: boolean; message: string }> {
    const cert = this.mockCertifications.find(c => c.id === certId);
    if (!cert) {
      return { verified: false, message: 'Certification not found' };
    }
    
    const now = new Date();
    if (cert.validUntil < now) {
      return { verified: false, message: 'Certification expired' };
    }
    
    return { verified: true, message: 'Certification is valid' };
  }

  static async getZones(): Promise<HalalZone[]> {
    return [...this.mockZones];
  }

  static async initiateZoneCleaning(zoneId: string): Promise<{ success: boolean; estimatedCompletion: Date }> {
    const zone = this.mockZones.find(z => z.id === zoneId);
    if (!zone) {
      throw new Error('Zone not found');
    }
    
    // Simulate cleaning process
    const estimatedCompletion = new Date();
    estimatedCompletion.setHours(estimatedCompletion.getHours() + 2);
    
    return {
      success: true,
      estimatedCompletion
    };
  }

  static async getHalalStats(): Promise<HalalStats> {
    const totalHalal = this.mockProducts.filter(p => p.halalStatus === HalalStatus.CERTIFIED).length;
    const totalNonHalal = this.mockProducts.filter(p => p.halalStatus === HalalStatus.NON_HALAL).length;
    const expiringSoon = this.mockCertifications.filter(c => c.daysUntilExpiry <= 30).length;
    const nonCompliant = this.mockProducts.filter(p => p.halalStatus === HalalStatus.QUARANTINE).length;
    const totalOccupancy = this.mockZones.reduce((sum, zone) => sum + zone.currentOccupancy, 0);
    const totalCapacity = this.mockZones.reduce((sum, zone) => sum + zone.capacity, 0);
    const zoneOccupancy = Math.round((totalOccupancy / totalCapacity) * 100);
    const pendingVerification = this.mockProducts.filter(p => p.halalStatus === HalalStatus.PENDING).length;
    
    return {
      totalHalal,
      totalNonHalal,
      expiringSoon,
      nonCompliant,
      zoneOccupancy,
      pendingVerification
    };
  }

  static async getComplianceAlerts(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];
    
    // Check for expiring certifications
    this.mockCertifications.forEach(cert => {
      if (cert.daysUntilExpiry <= 30) {
        alerts.push({
          id: `alert-${cert.id}`,
          type: 'CERTIFICATION_EXPIRY',
          severity: cert.daysUntilExpiry <= 7 ? 'CRITICAL' : 'HIGH',
          message: `Certification ${cert.certNumber} expires in ${cert.daysUntilExpiry} days`,
          timestamp: new Date(),
          resolved: false
        });
      }
    });
    
    // Check for zone capacity issues
    this.mockZones.forEach(zone => {
      if (zone.occupancyPercentage > 90) {
        alerts.push({
          id: `alert-${zone.id}`,
          type: 'ZONE_VIOLATION',
          severity: 'MEDIUM',
          message: `Zone ${zone.zoneCode} is ${zone.occupancyPercentage}% full`,
          zoneId: zone.id,
          timestamp: new Date(),
          resolved: false
        });
      }
    });
    
    return alerts;
  }
}