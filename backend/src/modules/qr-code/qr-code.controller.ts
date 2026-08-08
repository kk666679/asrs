import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';

@Controller('api/qr-code')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Post('generate')
  generateQrCode(@Body() data: any) {
    return this.qrCodeService.generateQrCode(data);
  }

  @Post('scan')
  scanQrCode(@Body() data: any) {
    return this.qrCodeService.scanQrCode(data);
  }

  @Post('validate')
  validateQrCode(@Body() data: any) {
    return this.qrCodeService.validateQrCode(data);
  }

  @Get('history')
  getScanHistory(@Query() query?: any) {
    return this.qrCodeService.getScanHistory(query);
  }

  @Get('stats')
  getStats() {
    return this.qrCodeService.getStats();
  }

  @Get(':code')
  getQrCodeInfo(@Param('code') code: string) {
    return this.qrCodeService.getQrCodeInfo(code);
  }

  @Post('batch-generate')
  batchGenerate(@Body() data: any) {
    return this.qrCodeService.batchGenerate(data);
  }
}