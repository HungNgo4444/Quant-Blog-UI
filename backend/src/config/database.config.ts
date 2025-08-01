import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Comment } from '../entities/comment.entity';
import { Like } from '../entities/like.entity';
import { View } from '../entities/view.entity';
import { Session } from '../entities/session.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import { SavedPost } from '../entities/saved-post.entity';
import { Notification } from '../entities/notification.entity';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';
import { Vote } from '../entities/vote.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'quant_blog',
    entities: [
      User,
      Post,
      Category,
      Tag,
      Comment,
      Like,
      View,
      Session,
      ActivityLog,
      SavedPost,
      Notification,
      Question,
      Answer,
      Vote,
    ],
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
    migrations: ['dist/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }),
); 