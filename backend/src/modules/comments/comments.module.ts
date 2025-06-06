import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from '../../entities/comment.entity';
import { Post } from '../../entities/post.entity';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from 'src/shared/shared.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post]),
    AuthModule,
    SharedModule,
    UsersModule
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
