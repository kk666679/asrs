import { Injectable } from '@nestjs/common';
import { RoboticsService } from '../../../lib/services/robotics';
import { RobotTask } from '../../../lib/types';

@Injectable()
export class RobotsService {
  constructor(private readonly roboticsService: RoboticsService) {}

  async getAllRobots(type?: string, status?: string, zoneId?: string) {
    return this.roboticsService.getAllRobots(type, status, zoneId);
  }

  async createRobot(data: {
    code: string;
    name: string;
    type: string;
    zoneId: string;
    location?: string;
  }) {
    return this.roboticsService.createRobot(data);
  }

  async getRobotStatus(id: string) {
    return this.roboticsService.getRobotStatus(id);
  }

  async scheduleTask(task: Omit<RobotTask, 'id'>) {
    return this.roboticsService.scheduleTask(task);
  }
}
