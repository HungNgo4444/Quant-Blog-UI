import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('likes')
@Unique(['postId', 'userId'])
@Index(['postId'])
@Index(['userId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  // @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  // post: Post;

  // @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  // user: User;
} 