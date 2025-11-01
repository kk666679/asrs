import { Module } from '@nestjs/common';
import { WarehouseManagementController } from './warehouse-management.controller';
import { WarehouseManagementService } from './warehouse-management.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [WarehouseManagementController],
  providers: [WarehouseManagementService, PrismaService],
  exports: [WarehouseManagementService],
})
export class WarehouseManagementModule {}