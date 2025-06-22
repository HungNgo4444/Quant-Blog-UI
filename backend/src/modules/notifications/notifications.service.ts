import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto, PaginatedNotificationsResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = this.notificationRepository.create(createNotificationDto);
    const savedNotification = await this.notificationRepository.save(notification);
    return this.findOneById(savedNotification.id);
  }

  async findUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    unreadOnly = false,
  ): Promise<PaginatedNotificationsResponseDto> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoin('users', 'actor', 'CAST(actor.id AS TEXT) = CAST(notification.actor_id AS TEXT)')
      .leftJoin('posts', 'post', 'CAST(post.id AS TEXT) = CAST(notification.post_id AS TEXT)')
      .select([
        'notification.id',
        'notification.type',
        'notification.title',
        'notification.message',
        'notification.is_read',
        'notification.recipient_id',
        'notification.actor_id',
        'notification.post_id',
        'notification.comment_id',
        'notification.metadata',
        'notification.created_at',
        'notification.updated_at',
        'actor.id',
        'actor.name',
        'actor.avatar',
        'post.id',
        'post.title',
        'post.slug',
      ])
      .where('notification.recipient_id = :userId', { userId });

    if (unreadOnly) {
      queryBuilder.andWhere('notification.is_read = :isRead', { isRead: false });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const results = await queryBuilder
      .orderBy('notification.created_at', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    // Get unread count
    const unreadCount = await this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });

    // Format results
    const notifications = results.map(this.formatNotificationResult);

    return {
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
      unreadCount,
    };
  }

  async findOneById(id: string): Promise<NotificationResponseDto> {
    const result = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoin('users', 'actor', 'CAST(actor.id AS TEXT) = CAST(notification.actor_id AS TEXT)')
      .leftJoin('posts', 'post', 'CAST(post.id AS TEXT) = CAST(notification.post_id AS TEXT)')
      .select([
        'notification.id',
        'notification.type',
        'notification.title',
        'notification.message',
        'notification.is_read',
        'notification.recipient_id',
        'notification.actor_id',
        'notification.post_id',
        'notification.comment_id',
        'notification.metadata',
        'notification.created_at',
        'notification.updated_at',
        'actor.id',
        'actor.name',
        'actor.avatar',
        'post.id',
        'post.title',
        'post.slug',
      ])
      .where('notification.id = :id', { id })
      .getRawOne();

    if (!result) {
      throw new NotFoundException('Notification not found');
    }

    return this.formatNotificationResult(result);
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.update(id, updateNotificationDto);
    return this.findOneById(id);
  }

  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<{ message: string; count: number }> {
    console.log(22222222222222222222222222222222222222);
    
    const result = await this.notificationRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );

    return {
      message: 'All notifications marked as read',
      count: result.affected || 0,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);
    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });

    return { count };
  }

  // Helper methods for creating specific notification types
  async createPostDeletedNotification(
    recipientId: string,
    actorId: string,
    postTitle: string,
    reason?: string,
  ): Promise<void> {
    await this.create({
      type: NotificationType.POST_DELETED,
      title: 'Bài viết đã bị xóa',
      message: `Bài viết "${postTitle}" của bạn đã bị xóa${reason ? ` với lý do: ${reason}` : ''}`,
      recipientId,
      actorId,
      metadata: {
        postTitle,
        reason,
      },
    });
  }

  async createPostCommentedNotification(
    recipientId: string,
    actorId: string,
    postId: string,
    commentId: string,
    postTitle: string,
    postSlug: string,
    commentContent: string,
  ): Promise<void> {
    // Don't send notification if user comments on their own post
    if (recipientId === actorId) return;

    await this.create({
      type: NotificationType.POST_COMMENTED,
      title: 'Bình luận mới',
      message: `Bài viết "${postTitle}" của bạn có bình luận mới`,
      recipientId,
      actorId,
      postId,
      commentId,
      metadata: {
        postTitle,
        postSlug,
        commentContent: commentContent.substring(0, 100),
        actionUrl: `/posts/${postSlug}#comment-${commentId}`,
      },
    });
  }

  async createCommentRepliedNotification(
    recipientId: string,
    actorId: string,
    postId: string,
    commentId: string,
    postTitle: string,
    postSlug: string,
    replyContent: string,
  ): Promise<void> {
    // Don't send notification if user replies to their own comment
    if (recipientId === actorId) return;

    await this.create({
      type: NotificationType.COMMENT_REPLIED,
      title: 'Phản hồi bình luận',
      message: `Bình luận của bạn trong bài "${postTitle}" có phản hồi mới`,
      recipientId,
      actorId,
      postId,
      commentId,
      metadata: {
        postTitle,
        postSlug,
        replyContent: replyContent.substring(0, 100),
        actionUrl: `/posts/${postSlug}#comment-${commentId}`,
      },
    });
  }

  async createPostApprovedNotification(
    recipientId: string,
    postId: string,
    postTitle: string,
    postSlug: string,
  ): Promise<void> {
    await this.create({
      type: NotificationType.POST_APPROVED,
      title: 'Bài viết được duyệt',
      message: `Bài viết "${postTitle}" của bạn đã được duyệt và xuất bản`,
      recipientId,
      postId,
      metadata: {
        postTitle,
        postSlug,
        actionUrl: `/posts/${postSlug}`,
      },
    });
  }

  async createSystemAnnouncementNotification(
    recipientId: string,
    title: string,
    message: string,
    actionUrl?: string,
  ): Promise<void> {
    await this.create({
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title,
      message,
      recipientId,
      metadata: {
        actionUrl,
      },
    });
  }

  private formatNotificationResult(raw: any): NotificationResponseDto {
    return {
      id: raw.notification_id,
      type: raw.notification_type,
      title: raw.notification_title,
      message: raw.notification_message,
      metadata: raw.notification_metadata,
      isRead: raw.is_read,
      recipientId: raw.recipient_id,
      actorId: raw.actor_id,
      postId: raw.post_id,
      commentId: raw.comment_id,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      actor: raw.actor_id ? {
        id: raw.actor_id,
        name: raw.actor_name,
        avatar: raw.actor_avatar,
      } : undefined,
      post: raw.post_id ? {
        id: raw.post_id,
        title: raw.post_title,
        slug: raw.post_slug,
      } : undefined,
    };
  }
}
