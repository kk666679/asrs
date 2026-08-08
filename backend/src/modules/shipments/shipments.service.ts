import { Injectable } from '@nestjs/common';

@Injectable()
export class ShipmentsService {
  private data: any[] = [];

  findAll(query?: any) {
    return [
      {
        id: '1',
        shipmentNumber: 'SH-2024-001',
        type: 'INBOUND',
        status: 'IN_TRANSIT',
        supplier: 'ABC Electronics',
        expectedArrival: new Date(Date.now() + 86400000).toISOString(),
        items: 25,
        totalValue: 15000
      },
      {
        id: '2',
        shipmentNumber: 'SH-2024-002',
        type: 'OUTBOUND',
        status: 'COMPLETED',
        customer: 'XYZ Retail',
        actualArrival: new Date().toISOString(),
        items: 18,
        totalValue: 8500
      }
    ];
  }

  track(trackingNumber: string) {
    return {
      trackingNumber,
      status: 'IN_TRANSIT',
      location: 'Distribution Center',
      estimatedDelivery: new Date(Date.now() + 172800000).toISOString(),
      updates: [
        { timestamp: new Date().toISOString(), status: 'SHIPPED', location: 'Origin' },
        { timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'IN_TRANSIT', location: 'Hub' }
      ]
    };
  }

  findOne(id: string) {
    return this.data.find(item => item.id === id);
  }

  create(createDto: any) {
    const newItem = {
      id: Date.now().toString(),
      ...createDto,
      createdAt: new Date().toISOString()
    };
    this.data.push(newItem);
    return newItem;
  }

  update(id: string, updateDto: any) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updateDto, updatedAt: new Date().toISOString() };
      return this.data[index];
    }
    return null;
  }

  remove(id: string) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      return this.data.splice(index, 1)[0];
    }
    return null;
  }
}