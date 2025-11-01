import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';

@Controller('api/shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.shipmentsService.findAll(query);
  }

  @Get('track/:trackingNumber')
  track(@Param('trackingNumber') trackingNumber: string) {
    return this.shipmentsService.track(trackingNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.shipmentsService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.shipmentsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipmentsService.remove(id);
  }
}