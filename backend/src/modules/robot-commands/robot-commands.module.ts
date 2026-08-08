import { Module } from '@nestjs/common';
import { RobotCommandsController } from './robot-commands.controller';
import { RobotCommandsService } from './robot-commands.service';

@Module({
  controllers: [RobotCommandsController],
  providers: [RobotCommandsService],
})
export class RobotCommandsModule {}