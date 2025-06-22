import { NotificationType } from '../../../entities/notification.entity';

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  recipientId: string;
  actorId?: string;
  postId?: string;
  commentId?: string;
  metadata?: {
    postTitle?: string;
    postSlug?: string;
    commentContent?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  actor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  post?: {
    id: string;
    title: string;
    slug: string;
  };
}

export class PaginatedNotificationsResponseDto {
  notifications: NotificationResponseDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  unreadCount: number;
} 