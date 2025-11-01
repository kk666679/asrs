import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.alertsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.alertsService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.alertsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertsService.remove(id);
  }
}