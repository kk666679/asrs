import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { OperationsService } from './operations.service';

@Controller('api/operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.operationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operationsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.operationsService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.operationsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operationsService.remove(id);
  }
}