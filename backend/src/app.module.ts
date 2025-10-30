import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RobotsModule } from './modules/robots/robots.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [RobotsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
