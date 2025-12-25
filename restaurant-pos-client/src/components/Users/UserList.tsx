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
import './UserList.css';
import './EmployeeStats.css';

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
      setError('Không thể tải danh sách người dùng.');
      console.error('Error fetching users:', err);
      showError('Không thể tải danh sách người dùng');
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
      showSuccess(`Đã đổi vai trò thành ${newRole}`);
    } catch (err) {
      console.error('Error changing role:', err);
      showError('Không thể đổi vai trò');
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
      showSuccess('Đã reset mật khẩu thành công');
    } catch (err) {
      console.error('Error resetting password:', err);
      showError('Không thể reset mật khẩu');
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
      const action = statusChangeUser.status ? 'vô hiệu hóa' : 'kích hoạt';
      showSuccess(`Đã ${action} người dùng thành công`);
    } catch (err: any) {
      console.error('Error toggling status:', err);
      showError(err.response?.data || 'Không thể thay đổi trạng thái');
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
      showSuccess('Đã xóa người dùng thành công');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showError(err.response?.data || 'Không thể xóa người dùng');
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
      <div className="user-list-container">
        <div className="header">
          <h2>👥 Quản lý Nhân viên</h2>
        </div>
        <SkeletonTable rows={5} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <div className="user-list-container">
          <div className="no-permission">
            <div className="no-permission-icon">🔒</div>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền truy cập trang quản lý người dùng.</p>
            <p>Chỉ có <strong>Admin</strong> mới có thể quản lý người dùng.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/')}
            >
              ← Quay về trang chủ
            </button>
          </div>
        </div>
      }
    >
      <div className="user-list-container">
        {/* Header Section */}
        <div className="user-header-section">
          <div className="header-content">
            <h2>QUẢN LÝ NHÂN SỰ</h2>
            <p>Quản lý tài khoản, phân quyền và trạng thái hoạt động của nhân viên</p>
            <div className="header-stats">
               <div className="stat-badge">
                  <span className="label">Tổng nhân viên</span>
                  <span className="value">{stats.total}</span>
               </div>
               <div className="stat-badge">
                  <span className="label">Đang hoạt động</span>
                  <span className="value">{stats.active}</span>
               </div>
               <div className="stat-badge">
                  <span className="label">Admin</span>
                  <span className="value">{stats.admins}</span>
               </div>
            </div>
          </div>
          
          <button className="btn-add-user" onClick={() => navigate('/users/new')}>
            <i className="fas fa-user-plus"></i> THÊM NHÂN VIÊN
          </button>
        </div>

        {/* Toolbar */}
        <div className="user-toolbar">
           <div className="filter-group">
              <button 
                className={`filter-chip ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                Tất cả
              </button>
              <button 
                className={`filter-chip ${roleFilter === 'Admin' ? 'active' : ''}`}
                onClick={() => setRoleFilter('Admin')}
              >
                👑 Admin
              </button>
              <button 
                className={`filter-chip ${roleFilter === 'Staff' ? 'active' : ''}`}
                onClick={() => setRoleFilter('Staff')}
              >
                👤 Staff
              </button>
           </div>
           
           <div className="search-box">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Tìm nhân viên..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* User Grid */}
        <div className="users-grid">
          {filteredUsers.map(user => (
            <div key={user.id} className={`user-card ${!user.isActive ? 'inactive' : ''}`}>
              <div className="card-top-decoration"></div>
              <div className="user-card-body">
                <div className="user-avatar-section">
                   <div className={`user-avatar ${user.role.toLowerCase()}`}>
                      {user.fullName.charAt(0).toUpperCase()}
                   </div>
                   <div className="user-main-info">
                      <h3>
                        {user.fullName}
                        {user.id === currentUserId && <span className="badge-you">You</span>}
                      </h3>
                      <span className="user-username">@{user.username}</span>
                      <span className="user-email">{user.email}</span>
                   </div>
                   <div className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role === 'Admin' ? '👑 Admin' : '👤 Staff'}
                   </div>
                </div>
                
                <div className="user-status-section">
                   <span className={`status-indicator ${user.isActive ? 'active' : 'inactive'}`}>
                      <i className={`fas fa-${user.isActive ? 'check-circle' : 'ban'}`}></i>
                      {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                   </span>
                   <span className="join-date">
                      Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                   </span>
                </div>
                
                <div className="user-card-actions">
                  <button 
                    className="btn-icon btn-edit"
                    onClick={() => navigate(`/users/edit/${user.id}`)}
                    title="Chỉnh sửa thông tin"
                  >
                    <i className="fas fa-user-edit"></i>
                  </button>
                  
                  <button 
                    className="btn-icon btn-role"
                    onClick={() => handleChangeRoleClick(user.id, user.fullName, user.role)}
                    disabled={user.id === currentUserId}
                    title="Đổi vai trò"
                  >
                    <i className="fas fa-user-tag"></i>
                  </button>

                  <button 
                    className="btn-icon btn-password"
                    onClick={() => handleResetPasswordClick(user.id, user.fullName)}
                    title="Đặt lại mật khẩu"
                  >
                    <i className="fas fa-key"></i>
                  </button>
                  
                  <button 
                    className={`btn-icon btn-toggle ${user.isActive ? 'danger' : 'success'}`}
                    onClick={() => handleToggleStatusClick(user.id, user.fullName, user.isActive)}
                    disabled={user.id === currentUserId}
                    title={user.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                  >
                    <i className={`fas fa-${user.isActive ? 'lock' : 'unlock'}`}></i>
                  </button>
                  
                  <button 
                    className="btn-icon btn-delete"
                    onClick={() => handleDeleteClick(user.id, user.fullName)}
                    disabled={user.id === currentUserId}
                    title="Xóa nhân viên"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="empty-state">
             <div className="empty-icon">
                <i className="fas fa-users-slash"></i>
             </div>
             <h3>Không tìm thấy nhân viên</h3>
             <p>{searchTerm ? `Không có kết quả cho "${searchTerm}"` : 'Chưa có nhân viên nào trong danh sách'}</p>
             {!searchTerm && (
              <button 
                className="btn-primary" 
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
          title="Xác nhận xóa người dùng"
          message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.name}"? Hành động này không thể hoàn tác.`}
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
