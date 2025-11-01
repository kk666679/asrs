import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RoboticsService } from '../../../lib/services/robotics';
import { RobotsService } from './robots.service';

@Controller('robots')
export class RobotsController {
  constructor(
    private readonly roboticsService: RoboticsService,
    private readonly robotsService: RobotsService,
  ) {}

  @Get()
  async getRobots(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('zoneId') zoneId?: string,
  ) {
    try {
      const robots = await this.roboticsService.getAllRobots(
        type,
        status,
        zoneId,
      );
      const summary = {
        total: robots.length,
        idle: robots.filter((r) => r.status === 'IDLE').length,
        working: robots.filter((r) => r.status === 'WORKING').length,
        maintenance: robots.filter((r) => r.status === 'MAINTENANCE').length,
        error: robots.filter((r) => r.status === 'ERROR').length,
      };
      return { robots, summary };
    } catch {
      throw new HttpException(
        'Failed to fetch robots',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createRobot(
    @Body()
    body: {
      code: string;
      name: string;
      type: string;
      zoneId: string;
      location?: string;
    },
  ) {
    try {
      const { code, name, type, zoneId, location } = body;

      if (!code || !name || !type || !zoneId) {
        throw new HttpException(
          'Missing required fields: code, name, type, zoneId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const robot = await this.roboticsService.createRobot({
        code,
        name,
        type,
        zoneId,
        location,
      });
      return robot;
    } catch {
      throw new HttpException(
        'Failed to create robot',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/status')
  async getRobotStatus(@Param('id') id: string) {
    try {
      const status = await this.roboticsService.getRobotStatus(id);
      return status;
    } catch {
      throw new HttpException(
        'Failed to get robot status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('schedule-task')
  async scheduleTask(
    @Body()
    body: {
      robotId: string;
      type: string;
      priority: string;
      parameters: Record<string, any>;
    },
  ) {
    try {
      const { robotId, type, priority, parameters } = body;

      if (!robotId || !type || !priority) {
        throw new HttpException(
          'Missing required fields: robotId, type, priority',
          HttpStatus.BAD_REQUEST,
        );
      }

      const taskId = await this.robotsService.scheduleTask({
        robotId,
        type: type as
          | 'MOVE'
          | 'PICK'
          | 'PLACE'
          | 'SCAN'
          | 'CALIBRATE'
          | 'EMERGENCY_STOP',
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        parameters,
        estimatedDuration: 0, // Default duration, can be calculated based on type
      });
      return { taskId };
    } catch {
      throw new HttpException(
        'Failed to schedule robot task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
