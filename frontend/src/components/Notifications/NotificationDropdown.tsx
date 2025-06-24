'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../store/slices/notificationSlice';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  BellRing,
  CheckCheck,
  Trash2,
  MoreHorizontal,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import notificationService from '../../services/NotificationService';
import Link from 'next/link';

const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector(
    (state) => state.notifications
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
      
      // Fetch unread count every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 600000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [isOpen, isAuthenticated, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification.id));
    }

    // Navigate to action URL if available
    if (notification.metadata?.actionUrl) {
      window.location.href = notification.metadata.actionUrl;
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dispatch(deleteNotification(notificationId));
  };

  const formatTimeVN = (dateString: string) => {
    console.log(notificationService.formatTime(dateString));
    return notificationService.formatTime(dateString);
  };

  const getNotificationIcon = (type: string) => {
    return notificationService.getNotificationIcon(type);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative !ml-1" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BellRing className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute bg-red-500 text-white -top-1 -left-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute -right-48 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Thông báo
              </h3>
              {unreadCount > 0 && (
                <Button
                  title="Đánh dấu tất cả đã đọc"
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:bg-gray-300 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-gray-700"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Bạn có {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                <p className="mt-2 text-sm">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <BellRing className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group ${
                        !notification.isRead
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                              !notification.isRead
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            {notification.actor?.avatar ? (
                              <img
                                src={notification.actor.avatar}
                                alt={notification.actor.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">
                                {getNotificationIcon(notification.type)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${
                                !notification.isRead
                                  ? 'text-gray-900 dark:text-white'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {notification.actor?.name} đã {notification.message}
                              {!notification.isRead && (
                              <Badge variant="destructive" className="h-2 w-2 p-0 ml-2 rounded-full" />
                            )}
                            </p>
                            <div className="flex items-center space-x-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDropdownId(notification.id);
                                      setShowDropdown(!showDropdown);
                                    }}
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                {showDropdownId === notification.id && showDropdown && (
                                <DropdownMenuContent align="end" className='absolute z-50 right-0 w-40'>
                                  {!notification.isRead && (
                                    <DropdownMenuItem
                                      className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(markNotificationAsRead(notification.id));
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Đánh dấu đã đọc
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                                    className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                  </DropdownMenuItem>
                                  </DropdownMenuContent>
                                )}
                              </DropdownMenu>
                            </div>
                          </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeVN(notification.createdAt)}
                              </span>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && (
                      <div className="mx-4 border-t border-gray-200 dark:border-gray-700" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Link href="/notifications" className="block">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => setIsOpen(false)}
                >
                  Xem tất cả thông báo
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 