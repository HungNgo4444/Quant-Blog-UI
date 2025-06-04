import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('views')
@Index(['postId', 'ipAddress', 'createdAt'])
@Index(['userId', 'postId'])
export class View {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ip_address' })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  referrer: string;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @Column({ name: 'reading_time', nullable: true })
  readingTime: number; // Time spent reading in seconds

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Foreign Keys
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'post_id' })
  postId: string;

  // Relations
  @ManyToOne(() => User, (user) => user.views, { onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => Post, (post) => post.views, { onDelete: 'CASCADE' })
  post: Post;
} 