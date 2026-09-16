import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { useNotificationStore } from '../store/notificationStore.js';
import axiosInstance from '../api/axios.js';

export function useNotifications() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const { 
    notifications, 
    unreadCount, 
    setNotifications, 
    prependNotification, 
    incrementUnread,
    markRead: markStoreRead,
    markAllRead: markStoreAllRead
  } = useNotificationStore();

  // 1. Fetch notifications via TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await axiosInstance.get('/notifications');
      return res.data.data;
    },
    enabled: isAuthenticated && !!token,
    staleTime: 30000,
  });

  // Populate store when data is loaded
  useEffect(() => {
    if (data) {
      setNotifications(data.notifications, data.unreadCount);
    }
  }, [data, setNotifications]);

  // 2. Setup Socket.io connection
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:9000/api').replace('/api', '');
    const socket = io(socketUrl, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.io connection established.');
    });

    socket.on('notification', (notif) => {
      prependNotification(notif);
      incrementUnread();
      
      // Trigger a standard text-based toast notification
      toast(`${notif.title}: ${notif.body}`, {
        icon: '🔔',
        duration: 4000
      });
    });

    socket.on('connect_error', (err) => {
      console.warn('❌ Socket.io connection warning:', err.message);
    });

    return () => {
      socket.disconnect();
      console.log('⚡ Socket.io disconnected.');
    };
  }, [isAuthenticated, token, prependNotification, incrementUnread]);

  // 3. Mark single notification as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.put(`/notifications/${id}/read`);
      return res.data.data;
    },
    onSuccess: (data) => {
      markStoreRead(data.id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // 4. Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.put('/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      markStoreAllRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate
  };
}

export default useNotifications;
