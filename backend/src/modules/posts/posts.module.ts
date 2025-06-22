import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from '../../entities/post.entity';
import { View } from '../../entities/view.entity';
import { Like } from '../../entities/like.entity';
import { SavedPost } from '../../entities/saved-post.entity';
import { Category } from '../../entities/category.entity';
import { Tag } from '../../entities/tag.entity';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from 'src/shared/shared.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, View, Like, SavedPost, Category, Tag]),
    AuthModule,
    SharedModule,
    NotificationsModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
