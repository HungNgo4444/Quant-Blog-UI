import instanceApi from '../lib/axios';

export interface NotificationResponse {
  id: string;
  type: string;
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
  createdAt: string;
  updatedAt: string;
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

export interface PaginatedNotificationsResponse {
  notifications: NotificationResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  unreadCount: number;
}

export interface CreateNotificationRequest {
  type: string;
  title: string;
  message: string;
  recipientId: string;
  actorId?: string;
  postId?: string;
  commentId?: string;
  metadata?: any;
}

class NotificationService {
  // Lấy danh sách thông báo của user
  async getUserNotifications(
    page = 1,
    limit = 20,
    unreadOnly = false
  ): Promise<PaginatedNotificationsResponse> {
    const response = await instanceApi.get('/notifications', {
      params: { page, limit, unreadOnly },
    });
    return response.data;
  }

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await instanceApi.get('/notifications/unread-count');
    return response.data;
  }

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    const response = await instanceApi.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(): Promise<{ message: string; count: number }> {
    const response = await instanceApi.patch('/notifications/mark-all-read');
    return response.data;
  }

  // Xóa thông báo
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await instanceApi.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  // Lấy chi tiết thông báo
  async getNotificationById(notificationId: string): Promise<NotificationResponse> {
    const response = await instanceApi.get(`/notifications/${notificationId}`);
    return response.data;
  }

  // Tạo thông báo (chỉ dành cho admin/system)
  async createNotification(data: CreateNotificationRequest): Promise<NotificationResponse> {
    const response = await instanceApi.post('/notifications', data);
    return response.data;
  }

  // Helper method để format thời gian
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000 - 7 * 60 * 60);

    if (diffInSeconds < 60) {
      return 'vừa xong';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ngày trước`;
    }

    // Sử dụng timezone Việt Nam cho việc hiển thị ngày
    return date.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  }

  // Helper method để lấy icon cho loại thông báo
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'post_deleted':
        return '🗑️';
      case 'post_liked':
        return '❤️';
      case 'post_commented':
        return '💬';
      case 'comment_replied':
        return '↩️';
      case 'post_approved':
        return '✅';
      case 'post_rejected':
        return '❌';
      case 'follower_new':
        return '👤';
      case 'system_announcement':
        return '📢';
      default:
        return '🔔';
    }
  }

  // Helper method để lấy màu cho loại thông báo
  getNotificationColor(type: string): string {
    switch (type) {
      case 'post_deleted':
        return 'text-red-600';
      case 'post_liked':
        return 'text-pink-600';
      case 'post_commented':
        return 'text-blue-600';
      case 'comment_replied':
        return 'text-green-600';
      case 'post_approved':
        return 'text-green-600';
      case 'post_rejected':
        return 'text-red-600';
      case 'follower_new':
        return 'text-purple-600';
      case 'system_announcement':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
