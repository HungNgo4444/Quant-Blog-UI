import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState, Notification } from '../../types';

const initialState: NotificationState = {
  notifications: [],
};

let notificationId = 0;

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        id: (++notificationId).toString(),
        duration: 5000, // Default 5 seconds
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    hideNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { showNotification, hideNotification, clearAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer; 