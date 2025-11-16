/**
 * Notification Types and Interfaces
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'order' | 'table';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
}
