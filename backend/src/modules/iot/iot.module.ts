import { Module } from '@nestjs/common';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';

@Module({
  controllers: [IotController],
  providers: [IotService],
})
export class IotModule {}