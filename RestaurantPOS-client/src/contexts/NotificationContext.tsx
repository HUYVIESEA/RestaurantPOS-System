/**
 * Notification Context
 * Manages in-app notifications
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Notification, NotificationType } from '../types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: NotificationType, title: string, message: string, actionUrl?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  // Save to localStorage whenever notifications change
  const saveNotifications = useCallback((notifs: Notification[]) => {
    localStorage.setItem('notifications', JSON.stringify(notifs));
  }, []);

const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    const newNotification: Notification = {
    id: `${Date.now()}-${Math.random()}`,
      type,
      title,
    message,
      timestamp: new Date(),
      read: false,
      actionUrl,
   icon: getIconForType(type)
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep max 50
      saveNotifications(updated);
      return updated;
    });

    // Play sound
    playNotificationSound();
  }, [saveNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
    n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
   return updated;
    });
}, [saveNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
return updated;
  });
  }, [saveNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
  unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
   removeNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
  throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Helper functions
function getIconForType(type: NotificationType): string {
  switch (type) {
    case 'order': return 'fa-shopping-cart';
    case 'table': return 'fa-chair';
    case 'success': return 'fa-check-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'error': return 'fa-times-circle';
  default: return 'fa-info-circle';
  }
}

function playNotificationSound() {
  // Simple beep sound
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
oscillator.stop(audioContext.currentTime + 0.5);
}

export default NotificationContext;
