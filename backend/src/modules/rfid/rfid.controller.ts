import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RfidService } from './rfid.service';

@Controller('api/rfid')
export class RfidController {
  constructor(private readonly rfidService: RfidService) {}

  @Get('tags')
  getTags(@Query() query?: any) {
    return this.rfidService.getTags(query);
  }

  @Get('readers')
  getReaders() {
    return this.rfidService.getReaders();
  }

  @Post('scan')
  scanTag(@Body() data: any) {
    return this.rfidService.scanTag(data);
  }

  @Post('write')
  writeTag(@Body() data: any) {
    return this.rfidService.writeTag(data);
  }

  @Get('tracking/:tagId')
  trackTag(@Param('tagId') tagId: string) {
    return this.rfidService.trackTag(tagId);
  }

  @Get('stats')
  getStats() {
    return this.rfidService.getStats();
  }

  @Post('bulk-scan')
  bulkScan(@Body() data: any) {
    return this.rfidService.bulkScan(data);
  }
}