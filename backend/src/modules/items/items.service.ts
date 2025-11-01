import { Injectable } from '@nestjs/common';

@Injectable()
export class ItemsService {
  private items = [
    {
      id: '1',
      sku: 'SKU001',
      name: 'Organic Rice',
      category: 'Food',
      weight: 1.5,
      temperature: 'AMBIENT',
      minStock: 10,
      maxStock: 100
    },
    {
      id: '2',
      sku: 'SKU002',
      name: 'Fresh Milk',
      category: 'Dairy',
      weight: 1.0,
      temperature: 'REFRIGERATED',
      minStock: 5,
      maxStock: 50
    }
  ];

  findAll() {
    return this.items;
  }

  findOne(id: string) {
    return this.items.find(item => item.id === id);
  }

  create(createItemDto: any) {
    const newItem = {
      id: Date.now().toString(),
      ...createItemDto
    };
    this.items.push(newItem);
    return newItem;
  }

  update(id: string, updateItemDto: any) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updateItemDto };
      return this.items[index];
    }
    return null;
  }

  remove(id: string) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }
}