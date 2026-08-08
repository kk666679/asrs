import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WarehouseManagementService } from './warehouse-management.service';

@Controller('warehouse-management')
export class WarehouseManagementController {
  constructor(private readonly warehouseService: WarehouseManagementService) {}

  @Get('warehouses')
  getWarehouses() {
    return this.warehouseService.getWarehouses();
  }

  @Get('zones/:warehouseId')
  getZones(@Param('warehouseId') warehouseId: string) {
    return this.warehouseService.getZones(warehouseId);
  }

  @Get('capacity/:warehouseId')
  getCapacity(@Param('warehouseId') warehouseId: string) {
    return this.warehouseService.getCapacity(warehouseId);
  }

  @Get('utilization')
  getUtilization(@Query('warehouseId') warehouseId?: string) {
    return this.warehouseService.getUtilization(warehouseId);
  }

  @Post('optimize-layout')
  optimizeLayout(@Body() data: { warehouseId: string }) {
    return this.warehouseService.optimizeLayout(data.warehouseId);
  }
}