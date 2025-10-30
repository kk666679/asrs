// Halal Inventory Management Types
export enum HalalStatus {
  CERTIFIED = 'CERTIFIED',
  PENDING = 'PENDING',
  NON_HALAL = 'NON_HALAL',
  EXPIRED = 'EXPIRED',
  QUARANTINE = 'QUARANTINE',
}

export enum StorageZoneType {
  HALAL = 'HALAL',
  NON_HALAL = 'NON_HALAL',
  QUARANTINE = 'QUARANTINE',
}

export enum CertificationStatus {
  VERIFIED = 'VERIFIED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  INVALID = 'INVALID',
}

export interface HalalProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  halalStatus: HalalStatus;
  certificationId?: string;
  supplierId: string;
  storageZone: StorageZoneType;
  currentStock: number;
  reorderPoint: number;
  expiryDate?: Date;
  batchNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HalalCertification {
  id: string;
  certNumber: string;
  issuingBody: string;
  validFrom: Date;
  validUntil: Date;
  verificationStatus: CertificationStatus;
  documentUrl?: string;
  ingredients: string[];
  productsCount: number;
  daysUntilExpiry: number;
}

export interface HalalZone {
  id: string;
  zoneCode: string;
  zoneType: StorageZoneType;
  capacity: number;
  currentOccupancy: number;
  temperatureRange: string;
  lastCleaned: Date;
  isOperational: boolean;
  products: HalalProduct[];
  occupancyPercentage: number;
}

export interface HalalStats {
  totalHalal: number;
  totalNonHalal: number;
  expiringSoon: number;
  nonCompliant: number;
  zoneOccupancy: number;
  pendingVerification: number;
}

export interface ComplianceAlert {
  id: string;
  type:
    | 'CERTIFICATION_EXPIRY'
    | 'CONTAMINATION_RISK'
    | 'ZONE_VIOLATION'
    | 'TEMPERATURE_BREACH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  productId?: string;
  zoneId?: string;
  timestamp: Date;
  resolved: boolean;
}
