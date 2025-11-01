import { Module } from '@nestjs/common';
import { IpfsService } from './ipfs.service';
import { IpfsController } from './ipfs.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [IpfsController],
  providers: [IpfsService, PrismaService],
  exports: [IpfsService],
})
export class IpfsModule {}
