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
import { Comment } from './comment.entity';

export enum LikeType {
  POST = 'post',
  COMMENT = 'comment',
}

@Entity('likes')
@Index(['userId', 'postId'], { unique: true, where: '"post_id" IS NOT NULL' })
@Index(['userId', 'commentId'], { unique: true, where: '"comment_id" IS NOT NULL' })
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LikeType,
  })
  type: LikeType;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Foreign Keys
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'post_id', nullable: true })
  postId: string;

  @Column({ name: 'comment_id', nullable: true })
  commentId: string;

  // Relations
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment, { onDelete: 'CASCADE' })
  comment: Comment;
} 