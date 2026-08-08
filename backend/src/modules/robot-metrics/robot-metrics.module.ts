import { Module } from '@nestjs/common';
import { RobotMetricsController } from './robot-metrics.controller';
import { RobotMetricsService } from './robot-metrics.service';

@Module({
  controllers: [RobotMetricsController],
  providers: [RobotMetricsService],
})
export class RobotMetricsModule {}