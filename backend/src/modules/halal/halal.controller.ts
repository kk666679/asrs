import { Controller, Get, Query } from '@nestjs/common';
import { HalalService } from './halal.service';

@Controller('api/halal')
export class HalalController {
  constructor(private readonly halalService: HalalService) {}

  @Get('products')
  getProducts(@Query() query: any) {
    return this.halalService.getProducts(query);
  }

  @Get('inventory')
  getInventory() {
    return this.halalService.getInventory();
  }
}