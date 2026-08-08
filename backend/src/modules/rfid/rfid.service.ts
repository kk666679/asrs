import { Injectable } from '@nestjs/common';

@Injectable()
export class RfidService {
  getTags(query?: any) {
    return [
      {
        id: '1',
        tagId: 'RF001234567890',
        epc: 'E2801160600002040000001F',
        itemName: 'Electronics Pallet',
        location: 'Zone A',
        status: 'ACTIVE',
        lastSeen: new Date().toISOString(),
        readCount: 45
      },
      {
        id: '2',
        tagId: 'RF001234567891',
        epc: 'E2801160600002040000002F',
        itemName: 'Food Container',
        location: 'Zone B',
        status: 'ACTIVE',
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        readCount: 23
      },
      {
        id: '3',
        tagId: 'RF001234567892',
        epc: 'E2801160600002040000003F',
        itemName: 'Medical Supplies',
        location: 'Zone C',
        status: 'LOST',
        lastSeen: new Date(Date.now() - 86400000).toISOString(),
        readCount: 12
      }
    ];
  }

  getReaders() {
    return [
      {
        id: '1',
        name: 'Reader-Gate-01',
        location: 'Main Entrance',
        status: 'ONLINE',
        signalStrength: 95,
        tagsInRange: 8,
        lastActivity: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Reader-Dock-02',
        location: 'Loading Dock',
        status: 'ONLINE',
        signalStrength: 87,
        tagsInRange: 12,
        lastActivity: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: '3',
        name: 'Reader-Zone-03',
        location: 'Storage Zone C',
        status: 'MAINTENANCE',
        signalStrength: 0,
        tagsInRange: 0,
        lastActivity: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }

  scanTag(data: any) {
    return {
      scanId: Date.now().toString(),
      tagId: data.tagId,
      epc: data.epc || `E280116060000204000000${Math.floor(Math.random() * 100)}F`,
      readerId: data.readerId || 'Reader-01',
      signalStrength: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString(),
      item: {
        name: 'Sample Item',
        sku: 'SKU001',
        location: 'Zone A'
      }
    };
  }

  writeTag(data: any) {
    return {
      writeId: Date.now().toString(),
      tagId: data.tagId,
      epc: data.epc,
      data: data.data,
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      writerId: data.writerId || 'Writer-01'
    };
  }

  trackTag(tagId: string) {
    return {
      tagId,
      currentLocation: 'Zone A - Rack 15',
      history: [
        {
          location: 'Loading Dock',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          readerId: 'Reader-Dock-02'
        },
        {
          location: 'Main Entrance',
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          readerId: 'Reader-Gate-01'
        },
        {
          location: 'Zone A - Rack 15',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          readerId: 'Reader-Zone-01'
        }
      ],
      totalReads: 67,
      firstSeen: new Date(Date.now() - 86400000).toISOString(),
      lastSeen: new Date().toISOString()
    };
  }

  getStats() {
    return {
      totalTags: 1247,
      activeTags: 1189,
      lostTags: 58,
      readersOnline: 8,
      readersOffline: 2,
      totalReads: 45678,
      readsToday: 1234,
      averageSignalStrength: 87.3,
      topLocations: [
        { location: 'Zone A', tagCount: 456 },
        { location: 'Zone B', tagCount: 389 },
        { location: 'Loading Dock', tagCount: 234 }
      ]
    };
  }

  bulkScan(data: any) {
    const tags = data.tags || [];
    return {
      scanId: Date.now().toString(),
      totalTags: tags.length,
      successfulReads: Math.floor(tags.length * 0.95),
      failedReads: Math.ceil(tags.length * 0.05),
      readerId: data.readerId || 'Reader-01',
      timestamp: new Date().toISOString(),
      tags: tags.map((tag: any, index: number) => ({
        tagId: tag.tagId || `RF00123456789${index}`,
        epc: tag.epc || `E280116060000204000000${index}F`,
        signalStrength: Math.floor(Math.random() * 100),
        status: Math.random() > 0.05 ? 'SUCCESS' : 'FAILED'
      }))
    };
  }
}