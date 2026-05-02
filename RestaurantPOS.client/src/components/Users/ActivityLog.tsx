import React, { useEffect, useState } from 'react';

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
  const [_loading, setLoading] = useState(true);

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
      case 'create': return <i className="fa-solid fa-plus text-green-500"></i>;
      case 'update': return <i className="fa-solid fa-pen text-blue-500"></i>;
      case 'delete': return <i className="fa-solid fa-trash-can text-red-500"></i>;
      case 'role_change': return <i className="fa-solid fa-rotate text-amber-500"></i>;
      case 'status_change': return <i className="fa-solid fa-lock text-purple-500"></i>;
      case 'password_reset': return <i className="fa-solid fa-key text-yellow-500"></i>;
      default: return <i className="fa-solid fa-file-lines text-slate-500"></i>;
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

  // if (loading) {
  //   return (
  //     <div className="activity-log">
  //       <div className="activity-log-header">
  //         <h3><i className="fa-solid fa-list mr-2"></i> Nhật ký hoạt động</h3>
  //       </div>
  //       <Loading message="Đang tải nhật ký..." size="small" />
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100"><i className="fa-solid fa-list mr-2"></i> Nhật ký hoạt động</h3>
        <button 
          className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-500 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2" 
          onClick={fetchActivityLogs}
        >
          <i className="fa-solid fa-rotate mr-2"></i> Làm mới
        </button>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400">
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-lg">
                {getActionIcon(log.action)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{getActionText(log.action)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">{formatTimestamp(log.timestamp)}</span>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    <strong className="text-slate-800 dark:text-slate-100">{log.performedBy}</strong> {log.details.toLowerCase()} cho{' '}
                    <strong className="text-slate-800 dark:text-slate-100">{log.targetUser}</strong>
                  </p>

                  {log.oldValue && log.newValue && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-rose-500 dark:text-rose-400 line-through">{log.oldValue}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-blue-700 dark:text-blue-500 font-semibold">{log.newValue}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {logs.length >= limit && (
        <div className="pt-2">
          <button className="w-full py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-500 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-lg transition-colors">
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
    <div className="h-full">
      <ActivityLog limit={5} />
    </div>
  );
};
