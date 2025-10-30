import { Module } from '@nestjs/common';
import { IpfsModule } from './modules/ipfs/ipfs.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RobotsModule } from './modules/robots/robots.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [RobotsModule, AuthModule, IpfsModule, BlockchainModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
