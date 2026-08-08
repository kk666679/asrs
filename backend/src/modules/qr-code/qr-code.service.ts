import { Injectable } from '@nestjs/common';

@Injectable()
export class QrCodeService {
  generateQrCode(data: any) {
    const qrId = `QR${Date.now()}`;
    return {
      qrId,
      code: qrId,
      data: data.data,
      format: 'PNG',
      size: data.size || 256,
      errorCorrection: data.errorCorrection || 'M',
      url: `/api/qr-code/image/${qrId}`,
      createdAt: new Date().toISOString()
    };
  }

  scanQrCode(data: any) {
    const mockItems = [
      { 
        code: 'QR001', 
        name: 'Warehouse Location A-01-01',
        type: 'LOCATION',
        data: { zone: 'A', aisle: '01', rack: '01' }
      },
      { 
        code: 'QR002', 
        name: 'Product SKU001',
        type: 'PRODUCT',
        data: { sku: 'SKU001', name: 'Organic Rice', price: 12.99 }
      },
      { 
        code: 'QR003', 
        name: 'Shipment SH-2024-001',
        type: 'SHIPMENT',
        data: { shipmentId: 'SH-2024-001', items: 25, destination: 'Store A' }
      }
    ];

    const item = mockItems.find(i => i.code === data.code) || {
      code: data.code,
      name: 'Unknown QR Code',
      type: 'UNKNOWN',
      data: {},
      status: 'NOT_FOUND'
    };

    return {
      scanId: Date.now().toString(),
      code: data.code,
      decodedData: item.data,
      item,
      timestamp: new Date().toISOString(),
      scanner: data.scanner || 'MOBILE_CAMERA',
      location: data.location || 'Unknown'
    };
  }

  validateQrCode(data: any) {
    const isValid = data.code && data.code.length >= 3;
    
    return {
      code: data.code,
      isValid,
      format: 'QR_CODE',
      errorCorrection: isValid ? 'VALID' : 'INVALID',
      dataIntegrity: isValid ? 'INTACT' : 'CORRUPTED',
      errors: isValid ? [] : ['Invalid QR code format'],
      timestamp: new Date().toISOString()
    };
  }

  getScanHistory(query?: any) {
    return [
      {
        id: '1',
        code: 'QR001',
        type: 'LOCATION',
        scanner: 'MOBILE_APP',
        location: 'Zone A',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: 'SUCCESS'
      },
      {
        id: '2',
        code: 'QR002',
        type: 'PRODUCT',
        scanner: 'HANDHELD_SCANNER',
        location: 'Receiving',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        status: 'SUCCESS'
      },
      {
        id: '3',
        code: 'INVALID_QR',
        type: 'UNKNOWN',
        scanner: 'MOBILE_APP',
        location: 'Zone C',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'FAILED'
      }
    ];
  }

  getStats() {
    return {
      totalScans: 2156,
      successfulScans: 2089,
      failedScans: 67,
      successRate: 96.9,
      scansByType: {
        LOCATION: 856,
        PRODUCT: 734,
        SHIPMENT: 499,
        UNKNOWN: 67
      },
      topScanners: [
        { scanner: 'MOBILE_APP', scans: 1234 },
        { scanner: 'HANDHELD_SCANNER', scans: 567 },
        { scanner: 'FIXED_SCANNER', scans: 355 }
      ]
    };
  }

  getQrCodeInfo(code: string) {
    return {
      code,
      type: 'QR_CODE',
      isValid: true,
      data: {
        type: 'LOCATION',
        zone: 'A',
        aisle: '01',
        rack: '01'
      },
      lastScanned: new Date().toISOString(),
      scanCount: 23,
      createdAt: new Date(Date.now() - 2592000000).toISOString()
    };
  }

  batchGenerate(data: any) {
    const items = data.items || [];
    return {
      batchId: Date.now().toString(),
      totalCodes: items.length,
      generatedCodes: items.map((item: any, index: number) => ({
        qrId: `QR${Date.now()}_${index}`,
        code: `QR${Date.now()}_${index}`,
        data: item.data,
        url: `/api/qr-code/image/QR${Date.now()}_${index}`
      })),
      timestamp: new Date().toISOString()
    };
  }
}