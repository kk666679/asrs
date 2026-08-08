import { Controller, Get, Param } from '@nestjs/common';
import { RobotMetricsService } from './robot-metrics.service';

@Controller('api/robot-metrics')
export class RobotMetricsController {
  constructor(private readonly robotMetricsService: RobotMetricsService) {}

  @Get()
  findAll() {
    return this.robotMetricsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.robotMetricsService.findOne(id);
  }
}