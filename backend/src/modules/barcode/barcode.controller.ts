import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BarcodeService } from './barcode.service';

@Controller('api/barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Post('generate')
  generateBarcode(@Body() data: any) {
    return this.barcodeService.generateBarcode(data);
  }

  @Post('scan')
  scanBarcode(@Body() data: any) {
    return this.barcodeService.scanBarcode(data);
  }

  @Post('validate')
  validateBarcode(@Body() data: any) {
    return this.barcodeService.validateBarcode(data);
  }

  @Get('history')
  getScanHistory(@Query() query?: any) {
    return this.barcodeService.getScanHistory(query);
  }

  @Get('stats')
  getStats() {
    return this.barcodeService.getStats();
  }

  @Get(':code')
  getBarcodeInfo(@Param('code') code: string) {
    return this.barcodeService.getBarcodeInfo(code);
  }
}