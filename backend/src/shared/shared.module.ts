import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from './services/redis.service';
import { EmailService } from './services/email.service';
import { ActivityLogService } from './services/activity-log.service';
import { ActivityLog } from '../entities/activity-log.entity';
import { ImageService } from './services/image.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ActivityLog]),
  ],
  providers: [RedisService, EmailService, ActivityLogService, ImageService],
  exports: [RedisService, EmailService, ActivityLogService, ImageService],
})
export class SharedModule {} 