import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications, unreadCount) => set({ 
    notifications, 
    unreadCount 
  }),

  prependNotification: (notification) => set((state) => {
    // Avoid duplicates
    if (state.notifications.some(n => n.id === notification.id)) {
      return state;
    }
    return {
      notifications: [notification, ...state.notifications],
    };
  }),

  incrementUnread: () => set((state) => ({ 
    unreadCount: state.unreadCount + 1 
  })),

  markRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => 
      n.id === id ? { ...n, isRead: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),

  markAllRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    unreadCount: 0
  }))
}));

export default useNotificationStore;
