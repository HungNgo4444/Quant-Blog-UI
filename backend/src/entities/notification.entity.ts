import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

export enum NotificationType {
  POST_DELETED = 'post_deleted',
  POST_LIKED = 'post_liked',
  POST_COMMENTED = 'post_commented',
  COMMENT_REPLIED = 'comment_replied',
  POST_APPROVED = 'post_approved',
  POST_REJECTED = 'post_rejected',
  FOLLOWER_NEW = 'follower_new',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'recipient_id' })
  @Index()
  recipientId: string;

  @Column({ name: 'actor_id', nullable: true })
  actorId: string;

  @Column({ name: 'post_id', nullable: true })
  postId: string;

  @Column({ name: 'comment_id', nullable: true })
  commentId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    postTitle?: string;
    postSlug?: string;
    commentContent?: string;
    actionUrl?: string;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
