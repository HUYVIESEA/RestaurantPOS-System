import React, { useEffect, useState } from 'react';
import './ActivityLog.css';

// ========================================
// ACTIVITY LOG TYPES
// ========================================

export interface ActivityLogEntry {
  id: number;
  timestamp: Date;
  action: 'create' | 'update' | 'delete' | 'role_change' | 'status_change' | 'password_reset';
  targetUser: string;
  performedBy: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

interface ActivityLogProps {
  userId?: number; // If provided, show logs for specific user
  limit?: number;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ userId, limit = 10 }) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, [userId]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await activityService.getLogs(userId, limit);
      
      // Mock data for now
      const mockLogs: ActivityLogEntry[] = [
        {
          id: 1,
          timestamp: new Date(Date.now() - 3600000),
          action: 'role_change',
          targetUser: 'Nguyễn Văn A',
          performedBy: 'Admin',
          details: 'Đổi vai trò',
          oldValue: 'Staff',
          newValue: 'Admin'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 7200000),
          action: 'password_reset',
          targetUser: 'Trần Thị B',
          performedBy: 'Admin',
          details: 'Reset mật khẩu'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 10800000),
          action: 'status_change',
          targetUser: 'Lê Văn C',
          performedBy: 'Admin',
          details: 'Thay đổi trạng thái',
          oldValue: 'Active',
          newValue: 'Inactive'
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 14400000),
          action: 'create',
          targetUser: 'Phạm Thị D',
          performedBy: 'Admin',
          details: 'Tạo tài khoản mới'
        },
        {
          id: 5,
          timestamp: new Date(Date.now() - 18000000),
          action: 'delete',
          targetUser: 'Hoàng Văn E',
          performedBy: 'Admin',
          details: 'Xóa tài khoản'
        }
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: ActivityLogEntry['action']) => {
    switch (action) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'role_change': return '🔄';
      case 'status_change': return '🔒';
      case 'password_reset': return '🔑';
      default: return '📝';
    }
  };

  const getActionColor = (action: ActivityLogEntry['action']) => {
    switch (action) {
      case 'create': return 'success';
      case 'update': return 'info';
      case 'delete': return 'danger';
      case 'role_change': return 'warning';
      case 'status_change': return 'warning';
      case 'password_reset': return 'info';
      default: return 'default';
    }
  };

  const getActionText = (action: ActivityLogEntry['action']) => {
    switch (action) {
      case 'create': return 'Tạo mới';
      case 'update': return 'Cập nhật';
      case 'delete': return 'Xóa';
      case 'role_change': return 'Đổi vai trò';
      case 'status_change': return 'Đổi trạng thái';
      case 'password_reset': return 'Reset mật khẩu';
      default: return 'Hành động';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="activity-log">
        <div className="activity-log-header">
          <h3>📋 Nhật ký hoạt động</h3>
        </div>
        <div className="activity-log-loading">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-log">
      <div className="activity-log-header">
        <h3>📋 Nhật ký hoạt động</h3>
        <button className="btn-refresh" onClick={fetchActivityLogs}>
          🔄 Làm mới
        </button>
      </div>

      <div className="activity-log-list">
        {logs.length === 0 ? (
          <div className="activity-log-empty">
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`activity-log-item ${getActionColor(log.action)}`}>
              <div className="activity-icon">
                {getActionIcon(log.action)}
              </div>

              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-action">{getActionText(log.action)}</span>
                  <span className="activity-time">{formatTimestamp(log.timestamp)}</span>
                </div>

                <div className="activity-details">
                  <p>
                    <strong>{log.performedBy}</strong> {log.details.toLowerCase()} cho{' '}
                    <strong>{log.targetUser}</strong>
                  </p>

                  {log.oldValue && log.newValue && (
                    <div className="activity-change">
                      <span className="old-value">{log.oldValue}</span>
                      <span className="arrow">→</span>
                      <span className="new-value">{log.newValue}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {logs.length >= limit && (
        <div className="activity-log-footer">
          <button className="btn-view-all">
            Xem tất cả hoạt động →
          </button>
        </div>
      )}
    </div>
  );
};

// ========================================
// ACTIVITY LOG WIDGET (for Dashboard)
// ========================================

export const ActivityLogWidget: React.FC = () => {
  return (
    <div className="activity-log-widget">
      <ActivityLog limit={5} />
    </div>
  );
};
