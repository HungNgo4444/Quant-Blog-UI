import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { User } from '../../entities/user.entity';
import { Session } from '../../entities/session.entity';
import { ActivityLog } from '../../entities/activity-log.entity';
import { EmailService } from '../../shared/services/email.service';
import { ActivityLogService } from '../../shared/services/activity-log.service';
import { RedisService } from '../../shared/services/redis.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, ActivityLog]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SharedModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    LocalStrategy,
    EmailService,
    ActivityLogService,
    RedisService,
  ],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {} 