import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { SensorsService } from './sensors.service';

@Controller('api/sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.sensorsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.sensorsService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.sensorsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sensorsService.remove(id);
  }
}