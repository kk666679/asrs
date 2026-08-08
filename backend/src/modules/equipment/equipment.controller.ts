import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('api/equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.equipmentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.equipmentService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.equipmentService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(id);
  }
}