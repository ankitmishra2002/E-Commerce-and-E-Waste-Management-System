import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckSquare, Inbox, ExternalLink } from 'lucide-react';

export default function NotificationDropdown({ notifications, markRead, markAllRead, onClose }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Format relative timestamp simply
  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markRead(notif.id);
    }
    
    // Redirect if link metadata is present
    if (notif.metadata) {
      let targetLink = '';
      if (notif.type === 'ORDER_PLACED' || notif.type === 'ORDER_STATUS_CHANGED') {
        targetLink = `/user/orders/${notif.metadata.orderId}/tracking`;
      } else if (notif.type === 'RETURN_REQUESTED' || notif.type === 'RETURN_APPROVED') {
        targetLink = '/orders';
      } else if (notif.type === 'COMPLAINT_RESOLVED') {
        targetLink = '/complaints';
      } else if (notif.type === 'VENDOR_VERIFIED') {
        targetLink = '/vendor/dashboard';
      } else if (notif.type === 'NEW_REVIEW') {
        targetLink = '/vendor/products';
      }

      if (targetLink) {
        navigate(targetLink);
      }
    }
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-dark-850 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-fade-in"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-dark-900/30">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Recent Notifications</span>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={() => {
              markAllRead();
              onClose();
            }}
            className="text-[10px] font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center space-x-1"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
        {notifications.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Inbox className="w-8 h-8 stroke-[1.5] mb-2" />
            <span className="text-xs">All caught up!</span>
          </div>
        ) : (
          notifications.slice(0, 10).map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 flex items-start space-x-2.5 cursor-pointer transition-colors ${
                notif.isRead 
                  ? 'bg-white hover:bg-slate-50 dark:bg-dark-850 dark:hover:bg-dark-800' 
                  : 'bg-brand-50/20 dark:bg-brand-950/10 hover:bg-brand-50/30 dark:hover:bg-brand-950/20'
              }`}
            >
              {/* Status Dot */}
              <div className="mt-1 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${notif.isRead ? 'bg-slate-300 dark:bg-slate-700' : 'bg-brand-600 dark:bg-brand-500'}`} />
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className={`text-xs truncate ${notif.isRead ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-slate-100'}`}>
                    {notif.title}
                  </p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {notif.body}
                </p>
              </div>

              {/* Action indicator if links exist */}
              {notif.metadata && (
                <div className="flex-shrink-0 self-center text-slate-400 hover:text-slate-600">
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
