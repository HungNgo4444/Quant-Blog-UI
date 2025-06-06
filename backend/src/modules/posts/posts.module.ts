import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from '../../entities/post.entity';
import { View } from '../../entities/view.entity';
import { Like } from '../../entities/like.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, View, Like]),
    AuthModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
