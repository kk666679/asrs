import { Module } from '@nestjs/common';
import { HalalController } from './halal.controller';
import { HalalService } from './halal.service';

@Module({
  controllers: [HalalController],
  providers: [HalalService],
})
export class HalalModule {}