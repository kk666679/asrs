import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { IotService } from './iot.service';

@Controller('api/iot')
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Get('devices')
  getDevices(@Query() query?: any) {
    return this.iotService.getDevices(query);
  }

  @Get('sensors')
  getSensors() {
    return this.iotService.getSensors();
  }

  @Get('readings')
  getReadings(@Query() query?: any) {
    return this.iotService.getReadings(query);
  }

  @Post('devices')
  createDevice(@Body() deviceData: any) {
    return this.iotService.createDevice(deviceData);
  }

  @Put('devices/:id')
  updateDevice(@Param('id') id: string, @Body() updateData: any) {
    return this.iotService.updateDevice(id, updateData);
  }

  @Post('commands')
  sendCommand(@Body() commandData: any) {
    return this.iotService.sendCommand(commandData);
  }
}