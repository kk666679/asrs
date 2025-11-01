import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { LogisticsService } from './logistics.service';

@Controller('api/logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  // Fleet Management
  @Get('fleet')
  getFleet(@Query() query?: any) {
    return this.logisticsService.findAll(query);
  }

  @Get('fleet/metrics')
  getFleetMetrics() {
    return this.logisticsService.getFleetMetrics();
  }

  @Get('fleet/:id')
  getFleetVehicle(@Param('id') id: string) {
    return this.logisticsService.findOne(id);
  }

  @Post('fleet')
  createFleetVehicle(@Body() createDto: any) {
    return this.logisticsService.create(createDto);
  }

  @Put('fleet/:id')
  updateFleetVehicle(@Param('id') id: string, @Body() updateDto: any) {
    return this.logisticsService.update(id, updateDto);
  }

  // Route Optimization
  @Get('routing')
  getRoutes() {
    return { routes: ['Route A', 'Route B', 'Route C'] };
  }

  @Post('routing')
  optimizeRoutes(@Body() data: any) {
    return this.logisticsService.optimizeRoutes(data);
  }

  // Tracking
  @Get('tracking')
  getAllTracking() {
    return { trackingData: 'All tracking information' };
  }

  @Get('tracking/:trackingNumber')
  trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return this.logisticsService.trackShipment(trackingNumber);
  }

  // General endpoints
  @Get()
  findAll(@Query() query?: any) {
    return this.logisticsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logisticsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.logisticsService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.logisticsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logisticsService.remove(id);
  }
}