import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [BlockchainController],
  providers: [BlockchainService, PrismaService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
