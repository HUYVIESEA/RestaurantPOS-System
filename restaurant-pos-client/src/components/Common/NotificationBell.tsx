/**
 * Notification Bell Component
 * Shows notification icon with badge and dropdown panel
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSignalR } from '../../contexts/SignalRContext';

interface NotificationBellProps {
  placement?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
}

const NotificationBell: React.FC<NotificationBellProps> = ({ placement = 'bottom-right' }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const { isConnected } = useSignalR();
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowPanel(false);
      }
    };

    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setShowPanel(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return `${Math.floor(seconds / 86400)} ngày trước`;
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500 bg-green-50 dark:bg-green-500/10';
      case 'error': return 'text-red-500 bg-red-50 dark:bg-red-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10';
      case 'info': return 'text-blue-600 bg-blue-50 dark:bg-blue-600/10';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10';
    }
  };

const getPlacementClasses = () => {
    switch (placement) {
      case 'bottom-right': return 'absolute top-full right-0 mt-3 origin-top-right';
      case 'top-right': return 'absolute bottom-full right-0 mb-3 origin-bottom-right';
      case 'bottom-left': return 'absolute top-full left-0 mt-3 origin-top-left';
      case 'top-left': return 'absolute bottom-full left-0 mb-3 origin-bottom-left';
      default: return 'absolute top-full right-0 mt-3 origin-top-right';
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button 
        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors relative group"
        onClick={() => setShowPanel(!showPanel)}
        title="Thông báo"
      >
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 text-xs font-bold text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className={`${getPlacementClasses()} w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/50 border border-gray-100 dark:border-slate-700 z-[9999] overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-bell text-blue-600"></i> Thông báo
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Đã kết nối' : 'Mất kết nối'}></span>
              {unreadCount > 0 && (
                <span className="text-xs font-normal text-blue-700 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button 
                  className="p-1.5 text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-500 rounded-md transition-colors" 
                  onClick={markAllAsRead} 
                  title="Đánh dấu đã đọc"
                >
                  <i className="fas fa-check-double"></i>
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md transition-colors" 
                  onClick={clearAll} 
                  title="Xóa tất cả"
                >
                  <i className="fas fa-trash-can"></i>
                </button>
              )}
              <button 
                className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-md transition-colors" 
                onClick={() => setShowPanel(false)} 
                title="Đóng"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <div className="w-16 h-16 mb-3 rounded-full bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center border border-gray-100 dark:border-slate-700">
                  <i className="fas fa-inbox text-2xl"></i>
                </div>
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`group relative flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                      notification.read 
                        ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50' 
                        : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {!notification.read && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 bg-blue-600 rounded-r transition-all duration-300 ease-out"></span>
                    )}
                    
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeStyles(notification.type)}`}>
                      <i className={`fas ${notification.icon || 'fa-bell'} text-lg`}></i>
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className={`text-sm mb-0.5 truncate ${notification.read ? 'font-medium text-gray-800 dark:text-gray-200' : 'font-semibold text-gray-900 dark:text-white'}`}>
                        {notification.title}
                      </p>
                      <p className={`text-xs line-clamp-2 ${notification.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                        <i className="far fa-clock"></i> {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>

                    <button
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-all focus:outline-none focus:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      title="Xóa thông báo này"
                    >
                      <i className="fas fa-xmark"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-700 rounded-b-xl">
              <button 
                className="w-full py-2 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => setShowPanel(false)}
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
