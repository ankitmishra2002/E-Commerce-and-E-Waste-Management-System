import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications.js';
import NotificationDropdown from './NotificationDropdown.jsx';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300 relative focus:outline-none"
        title="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-brand-600 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold ring-2 ring-white dark:ring-dark-950 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          markRead={markRead}
          markAllRead={markAllRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
