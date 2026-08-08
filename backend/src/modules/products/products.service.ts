import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private data: any[] = [];

  findAll(query?: any) {
    return this.data;
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