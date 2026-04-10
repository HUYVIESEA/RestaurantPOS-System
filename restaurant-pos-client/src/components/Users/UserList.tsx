import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, User } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonTable } from '../Common/Skeleton';
import { AdminOnly } from '../Common/Protected';
import ConfirmDialog from '../Common/ConfirmDialog';
import {
  ChangeRoleDialog,
  ResetPasswordDialog,
  ToggleStatusDialog
} from './EmployeeDialogs';
import { USER_MESSAGES, COMMON_MESSAGES } from '../../constants/messages';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'Staff'>('all');
  
  // Dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<{ id: number; name: string; role: string } | null>(null);
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<{ id: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusChangeUser, setStatusChangeUser] = useState<{ id: number; name: string; status: boolean } | null>(null);
  
  const currentUserId = currentUser?.id;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(USER_MESSAGES.LOAD_ERROR);
      console.error('Error fetching users:', err);
      showError(USER_MESSAGES.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Role Change Handlers
  const handleChangeRoleClick = (id: number, fullName: string, currentRole: string) => {
    setRoleChangeUser({ id, name: fullName, role: currentRole });
    setShowRoleDialog(true);
  };

  const handleConfirmRoleChange = async (newRole: string) => {
    if (!roleChangeUser) return;

    try {
      await userService.updateRole(roleChangeUser.id, newRole);
      await fetchUsers();
      showSuccess(USER_MESSAGES.ROLE_CHANGE_SUCCESS(newRole));
    } catch (err) {
      console.error('Error changing role:', err);
      showError(USER_MESSAGES.ROLE_CHANGE_ERROR);
    } finally {
      setShowRoleDialog(false);
      setRoleChangeUser(null);
    }
  };

  // Password Reset Handlers
  const handleResetPasswordClick = (id: number, fullName: string) => {
    setPasswordResetUser({ id, name: fullName });
    setShowPasswordDialog(true);
    setShowNewPassword(false);
  };

  const handleConfirmResetPassword = async () => {
    if (!passwordResetUser) return;

    try {
      const result = await userService.resetPassword(passwordResetUser.id);
      setNewPassword(result.newPassword);
      setShowNewPassword(true);
      showSuccess(USER_MESSAGES.PASSWORD_RESET_SUCCESS);
    } catch (err) {
      console.error('Error resetting password:', err);
      showError(USER_MESSAGES.PASSWORD_RESET_ERROR);
      setShowPasswordDialog(false);
      setPasswordResetUser(null);
    }
  };

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setPasswordResetUser(null);
    setNewPassword('');
    setShowNewPassword(false);
  };

  // Status Toggle Handlers
  const handleToggleStatusClick = (id: number, fullName: string, currentStatus: boolean) => {
    setStatusChangeUser({ id, name: fullName, status: currentStatus });
    setShowStatusDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeUser) return;

    try {
      await userService.updateStatus(statusChangeUser.id, !statusChangeUser.status);
      await fetchUsers();
      const successMsg = statusChangeUser.status ? USER_MESSAGES.STATUS_DEACTIVATE_SUCCESS : USER_MESSAGES.STATUS_ACTIVATE_SUCCESS;
      showSuccess(successMsg);
    } catch (err: any) {
      console.error('Error toggling status:', err);
      showError(err.response?.data || USER_MESSAGES.STATUS_CHANGE_ERROR);
    } finally {
      setShowStatusDialog(false);
      setStatusChangeUser(null);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (id: number, fullName: string) => {
    setUserToDelete({ id, name: fullName });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userService.delete(userToDelete.id);
      await fetchUsers();
      showSuccess(USER_MESSAGES.DELETE_SUCCESS);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showError(err.response?.data || USER_MESSAGES.DELETE_ERROR);
    } finally {
      setShowConfirmDialog(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setUserToDelete(null);
  };

  // Filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'Admin').length,
    staff: users.filter(u => u.role === 'Staff').length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6 border-b pb-4 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">👥 Quản lý Nhân viên</h2>
        </div>
        <SkeletonTable rows={5} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 p-4 rounded-xl border border-rose-200 dark:border-rose-800">{error}</div>
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Không có quyền truy cập</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-2">Bạn không có quyền truy cập trang quản lý người dùng.</p>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Chỉ có <strong className="text-slate-800 dark:text-slate-100">Admin</strong> mới có thể quản lý người dùng.</p>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors font-medium shadow-sm w-full" 
              onClick={() => navigate('/')}
            >
              ← Quay về trang chủ
            </button>
          </div>
        </div>
      }
    >
      <div className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">QUẢN LÝ NHÂN SỰ</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Quản lý tài khoản, phân quyền và trạng thái hoạt động của nhân viên</p>
            <div className="flex flex-wrap gap-3">
               <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Tổng nhân viên</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats.total}</span>
               </div>
               <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Đang hoạt động</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</span>
               </div>
               <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Admin</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.admins}</span>
               </div>
            </div>
          </div>
          
          <button className="whitespace-nowrap px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm flex items-center gap-2" onClick={() => navigate('/users/new')}>
            <i className="fas fa-user-plus"></i> THÊM NHÂN VIÊN
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              <button 
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${roleFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                onClick={() => setRoleFilter('all')}
              >
                Tất cả
              </button>
              <button 
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${roleFilter === 'Admin' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400'}`}
                onClick={() => setRoleFilter('Admin')}
              >
                👑 Admin
              </button>
              <button 
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${roleFilter === 'Staff' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'}`}
                onClick={() => setRoleFilter('Staff')}
              >
                👤 Staff
              </button>
           </div>
           
           <div className="relative w-full sm:w-64">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Tìm nhân viên..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user.id} className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md ${!user.isActive ? 'opacity-75 grayscale-[0.3]' : ''}`}>
              <div className={`h-2 w-full ${user.role === 'Admin' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
              <div className="p-5 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-sm ${user.role === 'Admin' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                      {user.fullName.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-2">
                        {user.fullName}
                        {user.id === currentUserId && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">You</span>}
                      </h3>
                      <div className="flex flex-col gap-0.5 mt-1 text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">@{user.username}</span>
                        <span className="text-slate-400 dark:text-slate-500 truncate" title={user.email}>{user.email}</span>
                      </div>
                   </div>
                   <div className={`px-2 py-1 rounded text-xs font-semibold border ${user.role === 'Admin' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400' : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'}`}>
                      {user.role === 'Admin' ? '👑 Admin' : '👤 Staff'}
                   </div>
                </div>
                
                <div className="flex justify-between items-center py-3 border-y border-slate-100 dark:border-slate-700 mb-4 text-sm">
                   <span className={`flex items-center gap-1.5 font-medium ${user.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      <i className={`fas fa-${user.isActive ? 'check-circle' : 'ban'}`}></i>
                      {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                   </span>
                   <span className="text-slate-400 dark:text-slate-500 text-xs">
                      Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                   </span>
                </div>
                
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <button 
                    className="flex-1 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                    onClick={() => navigate(`/users/edit/${user.id}`)}
                    title="Chỉnh sửa thông tin"
                  >
                    <i className="fas fa-user-pen"></i>
                  </button>
                  
                  <button 
                    className="flex-1 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleChangeRoleClick(user.id, user.fullName, user.role)}
                    disabled={user.id === currentUserId}
                    title="Đổi vai trò"
                  >
                    <i className="fas fa-user-tag"></i>
                  </button>

                  <button 
                    className="flex-1 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-amber-600 dark:text-amber-400 transition-colors"
                    onClick={() => handleResetPasswordClick(user.id, user.fullName)}
                    title="Đặt lại mật khẩu"
                  >
                    <i className="fas fa-key"></i>
                  </button>
                  
                  <button 
                    className={`flex-1 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${user.isActive ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400'}`}
                    onClick={() => handleToggleStatusClick(user.id, user.fullName, user.isActive)}
                    disabled={user.id === currentUserId}
                    title={user.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                  >
                    <i className={`fas fa-${user.isActive ? 'lock' : 'unlock'}`}></i>
                  </button>
                  
                  <button 
                    className="flex-1 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleDeleteClick(user.id, user.fullName)}
                    disabled={user.id === currentUserId}
                    title="Xóa nhân viên"
                  >
                    <i className="fas fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center text-center shadow-sm">
             <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl text-slate-400 mb-4">
                <i className="fas fa-users-slash"></i>
             </div>
             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Không tìm thấy nhân viên</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6">{searchTerm ? `Không có kết quả cho "${searchTerm}"` : 'Chưa có nhân viên nào trong danh sách'}</p>
             {!searchTerm && (
              <button 
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors" 
                onClick={() => navigate('/users/new')}
              >
                + Thêm nhân viên mới
              </button>
            )}
          </div>
        )}

        {/* Dialogs */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title={USER_MESSAGES.CONFIRM_DELETE_TITLE}
          message={COMMON_MESSAGES.CONFIRM_DELETE('nhân viên', userToDelete?.name)}
          confirmText="Xóa"
          cancelText="Hủy"
          type="danger"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        <ChangeRoleDialog
          isOpen={showRoleDialog}
          userName={roleChangeUser?.name || ''}
          currentRole={roleChangeUser?.role || ''}
          onConfirm={handleConfirmRoleChange}
          onCancel={() => {
            setShowRoleDialog(false);
            setRoleChangeUser(null);
          }}
        />

        <ResetPasswordDialog
          isOpen={showPasswordDialog}
          userName={passwordResetUser?.name || ''}
          newPassword={newPassword}
          showPassword={showNewPassword}
          onConfirm={handleConfirmResetPassword}
          onCancel={handleClosePasswordDialog}
        />

        <ToggleStatusDialog
          isOpen={showStatusDialog}
          userName={statusChangeUser?.name || ''}
          currentStatus={statusChangeUser?.status || false}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => {
            setShowStatusDialog(false);
            setStatusChangeUser(null);
          }}
        />
      </div>
    </AdminOnly>
  );
};

export default UserList;
