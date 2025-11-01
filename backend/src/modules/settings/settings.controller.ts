import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.settingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.settingsService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.settingsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}