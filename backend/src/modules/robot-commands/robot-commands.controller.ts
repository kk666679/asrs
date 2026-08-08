import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RobotCommandsService } from './robot-commands.service';

@Controller('api/robot-commands')
export class RobotCommandsController {
  constructor(private readonly robotCommandsService: RobotCommandsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.robotCommandsService.findAll(query);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.robotCommandsService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.robotCommandsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.robotCommandsService.remove(id);
  }
}