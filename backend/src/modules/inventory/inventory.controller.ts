import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('stock-levels')
  getStockLevels() {
    return this.inventoryService.getStockLevels();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findAll().find(item => item.id === id);
  }

  @Post()
  create(@Body() createInventoryDto: any) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return { id, ...updateDto, updatedAt: new Date().toISOString() };
  }

  @Put(':id/quantity')
  updateQuantity(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.inventoryService.updateQuantity(id, body.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { id, deleted: true };
  }
}