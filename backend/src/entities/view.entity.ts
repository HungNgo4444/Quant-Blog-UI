import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('views')
@Index(['postId', 'ipAddress', 'userAgent'])
export class View {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @CreateDateColumn({ name: 'viewed_at' })
  viewedAt: Date;

  // Relations
  @ManyToOne(() => Post, (post) => post.views, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, (user) => user.views, { onDelete: 'CASCADE' })
  user: User;
} 