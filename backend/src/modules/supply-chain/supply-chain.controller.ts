import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SupplyChainService } from './supply-chain.service';

@Controller('api/supply-chain')
export class SupplyChainController {
  constructor(private readonly supplyChainService: SupplyChainService) {}

  @Get()
  findAll() {
    return this.supplyChainService.findAll();
  }

  @Get('metrics')
  getMetrics() {
    return this.supplyChainService.getMetrics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplyChainService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.supplyChainService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.supplyChainService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supplyChainService.remove(id);
  }
}