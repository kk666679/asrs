import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
  findAll() {
    return [
      {
        id: '1',
        itemId: '1',
        sku: 'SKU001',
        name: 'Organic Rice',
        location: 'A-01-01',
        quantity: 50,
        minStock: 10,
        maxStock: 100,
        status: 'ACTIVE',
        lastCounted: new Date().toISOString(),
        value: 125.50
      },
      {
        id: '2',
        itemId: '2',
        sku: 'SKU002', 
        name: 'Fresh Milk',
        location: 'B-02-03',
        quantity: 25,
        minStock: 5,
        maxStock: 50,
        status: 'ACTIVE',
        lastCounted: new Date().toISOString(),
        value: 87.25
      },
      {
        id: '3',
        itemId: '3',
        sku: 'SKU003',
        name: 'Halal Chicken',
        location: 'C-03-05',
        quantity: 15,
        minStock: 8,
        maxStock: 40,
        status: 'LOW_STOCK',
        lastCounted: new Date().toISOString(),
        value: 245.75
      }
    ];
  }

  create(createInventoryDto: any) {
    return {
      id: Date.now().toString(),
      ...createInventoryDto,
      status: 'ACTIVE',
      lastCounted: new Date().toISOString()
    };
  }

  getStockLevels() {
    const inventory = this.findAll();
    return {
      totalItems: inventory.length,
      lowStockItems: inventory.filter(item => item.quantity <= item.minStock).length,
      totalValue: inventory.reduce((sum, item) => sum + (item.value || 0), 0),
      averageStock: Math.round(inventory.reduce((sum, item) => sum + item.quantity, 0) / inventory.length)
    };
  }

  updateQuantity(id: string, quantity: number) {
    // Mock implementation - in real app would update database
    return {
      id,
      quantity,
      updatedAt: new Date().toISOString()
    };
  }
}