import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  POST_CREATE = 'post_create',
  POST_UPDATE = 'post_update',
  POST_DELETE = 'post_delete',
  POST_PUBLISH = 'post_publish',
  POST_UNPUBLISH = 'post_unpublish',
  COMMENT_CREATE = 'comment_create',
  COMMENT_UPDATE = 'comment_update',
  COMMENT_DELETE = 'comment_delete',
  LIKE_POST = 'like_post',
  UNLIKE_POST = 'unlike_post',
  LIKE_COMMENT = 'like_comment',
  UNLIKE_COMMENT = 'unlike_comment',
  VIEW_POST = 'view_post',
  SHARE_POST = 'share_post',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGE = 'password_change',
  EMAIL_VERIFY = 'email_verify',
  PASSWORD_RESET = 'password_reset',
  CATEGORY_CREATE = 'category_create',
  CATEGORY_UPDATE = 'category_update',
  CATEGORY_DELETE = 'category_delete',
  TAG_CREATE = 'tag_create',
  TAG_UPDATE = 'tag_update',
  TAG_DELETE = 'tag_delete',
}

@Entity('activity_logs')
@Index(['userId', 'createdAt'])
@Index(['type', 'createdAt'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'ip_address' })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'resource_type', nullable: true })
  resourceType: string;

  @Column({ name: 'resource_id', nullable: true })
  resourceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Foreign Keys
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  // Relations
  @ManyToOne(() => User, (user) => user.activityLogs, { onDelete: 'SET NULL' })
  user: User;
} 