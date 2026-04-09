import { create } from "zustand";
import type { Notification } from "@/types";
import studentService from "@/services/student.service";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await studentService.getMyNotifications();
      set({ notifications: response.data });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await studentService.getUnreadNotificationCount();
      set({ unreadCount: response.data });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  markAsRead: async (id: number) => {
    try {
      await studentService.markNotificationAsRead(id);
      const { notifications, fetchUnreadCount } = get();
      set({
        notifications: notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      });
      await fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await studentService.markAllNotificationsAsRead();
      const { notifications } = get();
      set({
        notifications: notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },
}));
