
import { PrismaClient } from '@prisma/client';
import {
  HalalProduct,
  HalalCertification,
  HalalZone,
  HalalStats,
  ComplianceAlert,
  HalalStatus,
  StorageZoneType,
  CertificationStatus,
} from '../types/halal';

const prisma = new PrismaClient();

export class HalalInventoryService {
  // Mock data for zones since not fully implemented in database yet
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
      products: [],
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

  private static mockProducts: HalalProduct[] = [];
  private static mockCertifications: HalalCertification[] = [];
  static async getProducts(filters?: {
    halalStatus?: HalalStatus;
    storageZone?: StorageZoneType;
  }): Promise<HalalProduct[]> {
    const where: any = {};

    if (filters?.halalStatus) {
      // Map frontend enum to database enum
    const statusMap: { [key in HalalStatus]: string } = {
      [HalalStatus.CERTIFIED]: 'VALID',
      [HalalStatus.PENDING]: 'PENDING_RENEWAL',
      [HalalStatus.NON_HALAL]: 'REVOKED',
      [HalalStatus.EXPIRED]: 'EXPIRED',
      [HalalStatus.QUARANTINE]: 'SUSPENDED'
    };
    where.certificationStatus = statusMap[filters.halalStatus];
    }

    const products = await prisma.halalProduct.findMany({
      where,
      include: {
        certifications: true,
        inventory: true,
        manufacturer: true
      }
    });

    return products.map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || undefined,
      halalStatus: product.certificationStatus === 'VALID' ? HalalStatus.CERTIFIED :
                   product.certificationStatus === 'PENDING_RENEWAL' ? HalalStatus.PENDING :
                   product.certificationStatus === 'EXPIRED' ? HalalStatus.EXPIRED :
                   product.certificationStatus === 'SUSPENDED' ? HalalStatus.QUARANTINE :
                   HalalStatus.NON_HALAL,
      certificationId: product.certifications[0]?.id,
      supplierId: product.manufacturerId,
      storageZone: StorageZoneType.HALAL, // Default to HALAL for now
      currentStock: product.inventory[0]?.quantityOnHand || 0,
      reorderPoint: product.inventory[0]?.reorderPoint || 0,
      expiryDate: product.inventory[0]?.expiryDate || undefined,
      batchNumber: product.inventory[0]?.batchNumber || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  }

  static async createProduct(
    productData: Omit<HalalProduct, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<HalalProduct> {
    const product = await prisma.halalProduct.create({
      data: {
        sku: productData.sku,
        name: productData.name,
        description: productData.description,
        category: 'MEAT', // Default category
        weight: 1.0, // Default weight
        dimensions: '10x10x10 cm', // Default dimensions
        sourceCountry: 'Malaysia', // Default country
        manufacturerId: productData.supplierId,
        halalComplianceScore: 95.0,
        isHalalCertified: productData.halalStatus === HalalStatus.CERTIFIED,
        certificationStatus: productData.halalStatus === HalalStatus.CERTIFIED ? 'VALID' : 'PENDING_RENEWAL',
      },
      include: {
        certifications: true,
        inventory: true,
        manufacturer: true
      }
    });

    // Create inventory record
    if (productData.currentStock > 0) {
      await prisma.halalInventory.create({
        data: {
          productId: product.id,
          warehouseLocation: 'Main Warehouse',
          region: 'SOUTHEAST_ASIA',
          quantityOnHand: productData.currentStock,
          reorderPoint: productData.reorderPoint,
          maxStock: productData.currentStock * 2,
          expiryDate: productData.expiryDate,
          batchNumber: productData.batchNumber,
          complianceVerified: true,
        }
      });
    }

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || undefined,
      halalStatus: product.certificationStatus === 'VALID' ? HalalStatus.CERTIFIED : HalalStatus.PENDING,
      certificationId: product.certifications[0]?.id,
      supplierId: product.manufacturerId,
      storageZone: StorageZoneType.HALAL,
      currentStock: productData.currentStock,
      reorderPoint: productData.reorderPoint,
      expiryDate: productData.expiryDate,
      batchNumber: productData.batchNumber,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static async updateHalalStatus(
    productId: string,
    halalStatus: HalalStatus,
    certificationId?: string,
  ): Promise<HalalProduct> {
    const statusMap: { [key in HalalStatus]: string } = {
      [HalalStatus.CERTIFIED]: 'VALID',
      [HalalStatus.PENDING]: 'PENDING_RENEWAL',
      [HalalStatus.NON_HALAL]: 'NON_COMPLIANT',
      [HalalStatus.EXPIRED]: 'EXPIRED',
      [HalalStatus.QUARANTINE]: 'SUSPENDED'
    };

    const product = await prisma.halalProduct.update({
      where: { id: productId },
      data: {
        certificationStatus: statusMap[halalStatus] as any,
        updatedAt: new Date(),
      },
      include: {
        certifications: true,
        inventory: true,
        manufacturer: true
      }
    });

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || undefined,
      halalStatus,
      certificationId: product.certifications[0]?.id,
      supplierId: product.manufacturerId,
      storageZone: StorageZoneType.HALAL,
      currentStock: product.inventory[0]?.quantityOnHand || 0,
      reorderPoint: product.inventory[0]?.reorderPoint || 0,
      expiryDate: product.inventory[0]?.expiryDate || undefined,
      batchNumber: product.inventory[0]?.batchNumber || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static async getCertifications(): Promise<HalalCertification[]> {
    const certifications = await prisma.halalCertification.findMany({
      include: {
        product: true,
        certificationBody: true
      }
    });

    return certifications.map(cert => ({
      id: cert.id,
      certNumber: cert.certificateNumber,
      issuingBody: cert.certificationBody.name,
      validFrom: cert.issueDate,
      validUntil: cert.expiryDate,
      verificationStatus: cert.status === 'VALID' ? CertificationStatus.VERIFIED :
                         cert.status === 'EXPIRED' ? CertificationStatus.EXPIRED :
                         CertificationStatus.PENDING,
      documentUrl: undefined, // Not stored in current schema
      ingredients: [], // Would need to join with ingredients table
      productsCount: 1, // Each certification is for one product
      daysUntilExpiry: Math.ceil((cert.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    }));
  }

  static async verifyCertification(
    certId: string,
  ): Promise<{ verified: boolean; message: string }> {
    const cert = await prisma.halalCertification.findUnique({
      where: { id: certId }
    });

    if (!cert) {
      return { verified: false, message: 'Certification not found' };
    }

    const now = new Date();
    if (cert.expiryDate < now) {
      return { verified: false, message: 'Certification expired' };
    }

    if (cert.status !== 'VALID') {
      return { verified: false, message: 'Certification not valid' };
    }

    return { verified: true, message: 'Certification is valid' };
  }

  static async getZones(): Promise<HalalZone[]> {
    // Query zones from database - for halal, we consider zones with refrigerated temperature as halal zones
    const zones = await prisma.zone.findMany({
      where: {
        temperature: 'REFRIGERATED' // Assuming refrigerated zones are used for halal products
      },
      include: {
        bins: {
          include: {
            binItems: {
              include: {
                item: true
              }
            }
          }
        }
      }
    });

    return zones.map(zone => ({
      id: zone.id,
      zoneCode: zone.code,
      zoneType: StorageZoneType.HALAL, // Default to HALAL for halal zones
      capacity: zone.bins.reduce((sum, bin) => sum + bin.capacity, 0),
      currentOccupancy: zone.bins.reduce((sum, bin) => sum + bin.currentLoad, 0),
      temperatureRange: zone.temperature === 'REFRIGERATED' ? '2-4°C' : 'Ambient',
      lastCleaned: new Date(), // TODO: Add cleaning history to schema
      isOperational: true, // TODO: Add operational status
      products: [], // TODO: Link to halal products
      occupancyPercentage: zone.bins.length > 0 ?
        Math.round((zone.bins.reduce((sum, bin) => sum + bin.currentLoad, 0) /
                   zone.bins.reduce((sum, bin) => sum + bin.capacity, 0)) * 100) : 0
    }));
  }
  static async initiateZoneCleaning(
    zoneId: string,
  ): Promise<{ success: boolean; estimatedCompletion: Date }> {
    const zone = this.mockZones.find((z) => z.id === zoneId);
    if (!zone) {
      throw new Error('Zone not found');
    }

    // Simulate cleaning process
    const estimatedCompletion = new Date();
    estimatedCompletion.setHours(estimatedCompletion.getHours() + 2);

    return {
      success: true,
      estimatedCompletion,
    };
  }

  static async getHalalStats(): Promise<HalalStats> {
    // Query halal products from database
    const halalProducts = await prisma.halalProduct.findMany({
      include: {
        certifications: true
      }
    });

    const totalHalal = halalProducts.filter(p => p.certificationStatus === 'VALID').length;
    const totalNonHalal = halalProducts.filter(p => p.certificationStatus === 'REVOKED').length;
    const expiringSoon = halalProducts.filter(p =>
      p.certifications.some(c => {
        const daysUntilExpiry = Math.ceil((c.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30;
      })
    ).length;
    const nonCompliant = halalProducts.filter(p => p.certificationStatus === 'SUSPENDED').length;
    const pendingVerification = halalProducts.filter(p => p.certificationStatus === 'PENDING_RENEWAL').length;

    // Query zone occupancy from database
    const zones = await prisma.zone.findMany({
      where: {
        temperature: 'REFRIGERATED'
      },
      include: {
        bins: true
      }
    });

    const totalOccupancy = zones.reduce((sum, zone) => sum + zone.bins.reduce((binSum, bin) => binSum + bin.currentLoad, 0), 0);
    const totalCapacity = zones.reduce((sum, zone) => sum + zone.bins.reduce((binSum, bin) => binSum + bin.capacity, 0), 0);
    const zoneOccupancy = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

    return {
      totalHalal,
      totalNonHalal,
      expiringSoon,
      nonCompliant,
      zoneOccupancy,
      pendingVerification,
    };
  }

  static async getComplianceAlerts(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    // Check for expiring certifications from database
    const certifications = await prisma.halalCertification.findMany({
      include: {
        product: true
      }
    });

    certifications.forEach((cert) => {
      const daysUntilExpiry = Math.ceil((cert.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 30) {
        alerts.push({
          id: `alert-${cert.id}`,
          type: 'CERTIFICATION_EXPIRY',
          severity: daysUntilExpiry <= 7 ? 'CRITICAL' : 'HIGH',
          message: `Certification ${cert.certificateNumber} expires in ${daysUntilExpiry} days`,
          timestamp: new Date(),
          resolved: false,
        });
      }
    });

    // Check for zone capacity issues from database
    const zones = await prisma.zone.findMany({
      where: {
        temperature: 'REFRIGERATED'
      },
      include: {
        bins: true
      }
    });

    zones.forEach((zone) => {
      const totalCapacity = zone.bins.reduce((sum, bin) => sum + bin.capacity, 0);
      const totalOccupancy = zone.bins.reduce((sum, bin) => sum + bin.currentLoad, 0);
      const occupancyPercentage = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

      if (occupancyPercentage > 90) {
        alerts.push({
          id: `alert-${zone.id}`,
          type: 'ZONE_VIOLATION',
          severity: 'MEDIUM',
          message: `Zone ${zone.code} is ${occupancyPercentage}% full`,
          zoneId: zone.id,
          timestamp: new Date(),
          resolved: false,
        });
      }
    });

    return alerts;
  }
}
