'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { removeNotificationFromList } from '../../store/slices/notificationSlice';
import { toast } from 'react-toastify';
import { NotificationResponse } from '../../services/NotificationService';

const NotificationManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notifications);

  const handleClose = (id: string) => {
    dispatch(removeNotificationFromList(id));
  };

  const getToastType = (type: string): 'success' | 'error' | 'info' | 'warning' | 'default' => {
    switch (type) {
      case 'post_approved':
        return 'success';
      case 'post_deleted':
      case 'post_rejected':
        return 'error';
      case 'post_liked':
      case 'post_commented':
      case 'comment_replied':
        return 'info';
      case 'system_announcement':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getNotificationIcon = (type: string): string => {
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
  };

  const showToastNotification = (notification: NotificationResponse) => {
    const icon = getNotificationIcon(notification.type);
    const type = getToastType(notification.type);
    const message = `${icon} ${notification.title}: ${notification.message}`;
    
    const toastOptions = {
      position: "bottom-right" as const,
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClick: () => {
        // Navigate to action URL if available
        if (notification.metadata?.actionUrl) {
          window.location.href = notification.metadata.actionUrl;
        }
        handleClose(notification.id);
      },
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
        break;
    }
  };

  // Keep track of shown notifications to avoid duplicates
  const [shownNotifications, setShownNotifications] = React.useState<Set<string>>(new Set());

  // Listen for new unread notifications and show toast
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.isRead && !shownNotifications.has(n.id));
    
    unreadNotifications.forEach(notification => {
      // Only show toast for very recent notifications (within last 60 seconds)
      const notificationTime = new Date(notification.createdAt).getTime();
      const now = new Date().getTime();
      const timeDiff = now - notificationTime;
      
      if (timeDiff < 60000) { // 60 seconds
        showToastNotification(notification);
        setShownNotifications(prev => new Set(prev).add(notification.id));
      }
    });
  }, [notifications, shownNotifications]);

  // This component doesn't render anything visible
  // It only manages toast notifications
  return null;
};

export default NotificationManager; 