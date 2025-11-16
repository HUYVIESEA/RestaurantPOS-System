/**
 * Notification Bell Component
 * Shows notification icon with badge and dropdown panel
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import './NotificationBell.css';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [showPanel, setShowPanel] = useState(false);

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

  return (
    <div className="notification-bell">
  <button
        className="bell-button"
        onClick={() => setShowPanel(!showPanel)}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
       <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <div className="panel-header">
    <h3>
           <i className="fas fa-bell"></i> Thông báo
     {unreadCount > 0 && <span className="unread-count">({unreadCount} mới)</span>}
   </h3>
   <div className="panel-actions">
       {unreadCount > 0 && (
   <button className="action-btn" onClick={markAllAsRead} title="Đánh dấu đã đọc">
      <i className="fas fa-check-double"></i>
 </button>
    )}
    {notifications.length > 0 && (
         <button className="action-btn" onClick={clearAll} title="Xóa tất cả">
           <i className="fas fa-trash"></i>
                </button>
            )}
   <button className="action-btn" onClick={() => setShowPanel(false)} title="Đóng">
    <i className="fas fa-times"></i>
     </button>
     </div>
          </div>

      <div className="panel-body">
  {notifications.length === 0 ? (
   <div className="empty-notifications">
      <i className="fas fa-inbox"></i>
      <p>Không có thông báo</p>
    </div>
     ) : (
        <div className="notification-list">
        {notifications.map(notification => (
       <div
         key={notification.id}
        className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
    onClick={() => handleNotificationClick(notification)}
     >
            <div className="notification-icon">
        <i className={`fas ${notification.icon}`}></i>
     </div>
        <div className="notification-content">
    <h4>{notification.title}</h4>
    <p>{notification.message}</p>
    <span className="notification-time">{getTimeAgo(notification.timestamp)}</span>
        </div>
         <button
         className="remove-btn"
      onClick={(e) => {
       e.stopPropagation();
           removeNotification(notification.id);
        }}
    title="Xóa"
     >
        <i className="fas fa-times"></i>
     </button>
           </div>
     ))}
    </div>
   )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
