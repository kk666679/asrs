import { Module } from '@nestjs/common';
import { RobotsController } from './robots.controller';
import { RobotsService } from './robots.service';
import { RoboticsService } from '../../../lib/services/robotics';

@Module({
  controllers: [RobotsController],
  providers: [RobotsService, RoboticsService],
  exports: [RobotsService],
})
export class RobotsModule {}
