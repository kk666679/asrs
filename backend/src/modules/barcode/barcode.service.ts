import { Injectable } from '@nestjs/common';

@Injectable()
export class BarcodeService {
  generateBarcode(data: any) {
    const barcodeId = `BC${Date.now()}`;
    return {
      barcodeId,
      code: barcodeId,
      type: data.type || 'CODE128',
      data: data.data,
      format: 'PNG',
      url: `/api/barcode/image/${barcodeId}`,
      createdAt: new Date().toISOString()
    };
  }

  scanBarcode(data: any) {
    const mockItems = [
      { code: 'BC001', name: 'Organic Rice', location: 'A-01-01', quantity: 50 },
      { code: 'BC002', name: 'Fresh Milk', location: 'B-02-03', quantity: 25 },
      { code: 'BC003', name: 'Halal Chicken', location: 'C-03-05', quantity: 15 }
    ];

    const item = mockItems.find(i => i.code === data.code) || {
      code: data.code,
      name: 'Unknown Item',
      location: 'Unknown',
      quantity: 0,
      status: 'NOT_FOUND'
    };

    return {
      scanId: Date.now().toString(),
      code: data.code,
      item,
      timestamp: new Date().toISOString(),
      scanner: data.scanner || 'MOBILE_APP',
      location: data.location || 'Unknown'
    };
  }

  validateBarcode(data: any) {
    const isValid = data.code && data.code.length >= 6;
    
    return {
      code: data.code,
      isValid,
      format: isValid ? 'CODE128' : 'INVALID',
      checksum: isValid ? 'VALID' : 'INVALID',
      errors: isValid ? [] : ['Invalid barcode format'],
      timestamp: new Date().toISOString()
    };
  }

  getScanHistory(query?: any) {
    return [
      {
        id: '1',
        code: 'BC001',
        itemName: 'Organic Rice',
        scanner: 'HANDHELD_01',
        location: 'Zone A',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'SUCCESS'
      },
      {
        id: '2',
        code: 'BC002',
        itemName: 'Fresh Milk',
        scanner: 'MOBILE_APP',
        location: 'Zone B',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: 'SUCCESS'
      },
      {
        id: '3',
        code: 'INVALID123',
        itemName: null,
        scanner: 'HANDHELD_02',
        location: 'Zone C',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        status: 'FAILED'
      }
    ];
  }

  getStats() {
    return {
      totalScans: 1247,
      successfulScans: 1189,
      failedScans: 58,
      successRate: 95.3,
      topScanners: [
        { scanner: 'HANDHELD_01', scans: 456 },
        { scanner: 'MOBILE_APP', scans: 389 },
        { scanner: 'HANDHELD_02', scans: 234 }
      ],
      scansByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        scans: Math.floor(Math.random() * 100)
      }))
    };
  }

  getBarcodeInfo(code: string) {
    return {
      code,
      type: 'CODE128',
      isValid: true,
      item: {
        name: 'Sample Item',
        sku: 'SKU001',
        location: 'A-01-01',
        quantity: 50
      },
      lastScanned: new Date().toISOString(),
      scanCount: 15
    };
  }
}