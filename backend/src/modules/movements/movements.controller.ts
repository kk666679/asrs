import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { MovementsService } from './movements.service';

@Controller('api/movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.movementsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movementsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.movementsService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.movementsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movementsService.remove(id);
  }
}