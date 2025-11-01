import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';

@Module({
  controllers: [LogisticsController],
  providers: [LogisticsService],
})
export class LogisticsModule {}