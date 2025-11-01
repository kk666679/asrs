import { Module } from '@nestjs/common';
import { BarcodeController } from './barcode.controller';
import { BarcodeService } from './barcode.service';

@Module({
  controllers: [BarcodeController],
  providers: [BarcodeService],
})
export class BarcodeModule {}