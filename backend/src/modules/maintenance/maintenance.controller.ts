import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';

@Controller('api/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.maintenanceService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.maintenanceService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.maintenanceService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}