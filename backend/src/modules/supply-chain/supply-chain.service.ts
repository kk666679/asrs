import { Injectable } from '@nestjs/common';

@Injectable()
export class SupplyChainService {
  private data = [
    {
      id: '1',
      name: 'Electronics Supply Chain',
      suppliers: 15,
      activeOrders: 45,
      onTimeDelivery: 94.2,
      totalValue: 2500000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Food & Beverage Chain',
      suppliers: 8,
      activeOrders: 23,
      onTimeDelivery: 97.8,
      totalValue: 1200000,
      status: 'active'
    }
  ];

  findAll() {
    return this.data;
  }

  getMetrics() {
    return {
      totalSuppliers: this.data.reduce((sum, item) => sum + item.suppliers, 0),
      totalOrders: this.data.reduce((sum, item) => sum + item.activeOrders, 0),
      avgOnTimeDelivery: this.data.reduce((sum, item) => sum + item.onTimeDelivery, 0) / this.data.length,
      totalValue: this.data.reduce((sum, item) => sum + item.totalValue, 0),
      activeChains: this.data.filter(item => item.status === 'active').length
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
      this.data[index] = { ...this.data[index], ...updateDto };
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