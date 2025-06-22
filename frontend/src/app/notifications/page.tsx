'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../store/slices/notificationSlice';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  BellRing,
  CheckCheck,
  Trash2,
  MoreHorizontal,
  Eye,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import notificationService from '../../services/NotificationService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    pagination,
    error 
  } = useAppSelector((state) => state.notifications);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openDropdownFilter, setOpenDropdownFilter] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ 
        page: currentPage, 
        limit: 20, 
        unreadOnly: filter === 'unread' 
      }));
    }
  }, [isAuthenticated, dispatch, currentPage, filter]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification.id));
    }

    // Navigate to action URL if available
    if (notification.metadata?.actionUrl) {
      router.push(notification.metadata.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await dispatch(deleteNotification(notificationId));
    setOpenDropdownId(null);
  };

  const handleRefresh = () => {
    dispatch(fetchNotifications({ 
      page: currentPage, 
      limit: 20, 
      unreadOnly: filter === 'unread' 
    }));
  };

  const handleDropdownToggle = (notificationId: string) => {
    setOpenDropdownId(openDropdownId === notificationId ? null : notificationId);
  };

  const formatTime = (dateString: string) => {
    return notificationService.formatTime(dateString);
  };

  const getNotificationIcon = (type: string) => {
    return notificationService.getNotificationIcon(type);
  };

  const getNotificationColor = (type: string) => {
    return notificationService.getNotificationColor(type);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Thông báo</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="outline" size="sm" onClick={() => setOpenDropdownFilter(!openDropdownFilter)}>
                      <Filter className="h-4 w-4 mr-2" />
                      {filter === 'all' ? 'Tất cả' : 'Chưa đọc'}
                    </Button>
                  </DropdownMenuTrigger>
                  {openDropdownFilter && (
                    <DropdownMenuContent align="end" className='absolute z-50'>
                      <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' onClick={() => {setFilter('all'); setOpenDropdownFilter(false)}}>
                        Tất cả thông báo
                      </DropdownMenuItem>
                      <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' onClick={() => {setFilter('unread'); setOpenDropdownFilter(false)}}>
                        Chưa đọc
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>

                {openDropdownFilter && (
                  <div className='fixed inset-0 z-30' onClick={() => setOpenDropdownFilter(false)}>
                    
                  </div>
                )}

                {unreadCount > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className='bg-black dark:bg-white dark:text-black'
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Đánh dấu tất cả đã đọc
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-500 dark:text-gray-400">Đang tải thông báo...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellRing className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'unread' 
                    ? 'Tất cả thông báo đã được đọc' 
                    : 'Khi có hoạt động mới, thông báo sẽ xuất hiện ở đây'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      !notification.isRead
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            !notification.isRead
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}
                        >
                          {notification.actor?.avatar ? (
                            <img
                              src={notification.actor.avatar}
                              alt={notification.actor.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">
                              {getNotificationIcon(notification.type)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4
                              className={`text-sm font-medium ${
                                !notification.isRead
                                  ? 'text-gray-900 dark:text-white'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {notification.actor?.name} đã {notification.message}
                            </h4>
                            {!notification.isRead && (
                              <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(notification.createdAt)}
                            </span>
                            <div className="relative dropdown-container">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDropdownToggle(notification.id);
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                              
                              {openDropdownId === notification.id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                  {!notification.isRead && (
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center first:rounded-t-md"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(markNotificationAsRead(notification.id));
                                        setOpenDropdownId(null);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Đánh dấu đã đọc
                                    </button>
                                  )}
                                  <button
                                    className={`w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${!notification.isRead ? 'rounded-b-md' : 'rounded-md'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotification(notification.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      Trước
                    </Button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Trang {currentPage} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages || loading}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage; 