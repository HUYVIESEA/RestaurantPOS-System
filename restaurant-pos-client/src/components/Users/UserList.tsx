import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, User } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonTable } from '../Common/Skeleton';
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
    <div className="user-list-container">
      {/* Header */}
      <div className="header">
        <h2>👥 Quản lý Nhân viên</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/users/new')}
        >
          <i className="fas fa-plus"></i> Thêm nhân viên
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="employee-stats">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h4>Tổng nhân viên</h4>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h4>Đang hoạt động</h4>
            <p className="stat-number">{stats.active}</p>
          </div>
        </div>

        <div className="stat-card inactive">
          <div className="stat-icon">⛔</div>
          <div className="stat-content">
            <h4>Đã khóa</h4>
            <p className="stat-number">{stats.inactive}</p>
          </div>
        </div>

        <div className="stat-card admins">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h4>Admin</h4>
            <p className="stat-number">{stats.admins}</p>
          </div>
        </div>

        <div className="stat-card staff">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h4>Staff</h4>
            <p className="stat-number">{stats.staff}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            Tất cả ({users.length})
          </button>
          <button 
            className={`filter-btn ${roleFilter === 'Admin' ? 'active' : ''}`}
            onClick={() => setRoleFilter('Admin')}
          >
            👑 Admin ({stats.admins})
          </button>
          <button 
            className={`filter-btn ${roleFilter === 'Staff' ? 'active' : ''}`}
            onClick={() => setRoleFilter('Staff')}
          >
            👤 Staff ({stats.staff})
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className={!user.isActive ? 'inactive' : ''}>
                <td>
                  <strong>{user.username}</strong>
                  {user.id === currentUserId && (
                    <span className="badge badge-info">You</span>
                  )}
                </td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role.toLowerCase()}`}>
                    {user.role === 'Admin' ? '👑 Admin' : '👤 Staff'}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? '✅ Hoạt động' : '⛔ Khóa'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => navigate(`/users/edit/${user.id}`)}
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleChangeRoleClick(user.id, user.fullName, user.role)}
                      disabled={user.id === currentUserId}
                      title="Đổi vai trò"
                    >
                      🔄
                    </button>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleResetPasswordClick(user.id, user.fullName)}
                      title="Reset mật khẩu"
                    >
                      🔑
                    </button>
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleStatusClick(user.id, user.fullName, user.isActive)}
                      disabled={user.id === currentUserId}
                      title={user.isActive ? 'Khóa' : 'Kích hoạt'}
                    >
                      {user.isActive ? '🔒' : '🔓'}
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDeleteClick(user.id, user.fullName)}
                      disabled={user.id === currentUserId}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-user-slash"></i>
            <h3>Không tìm thấy người dùng</h3>
            <p>
              {searchTerm
                ? `Không có người dùng nào khớp với "${searchTerm}"`
                : 'Chưa có người dùng nào trong hệ thống'}
            </p>
            {!searchTerm && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/users/new')}
              >
                <i className="fas fa-plus"></i> Thêm người dùng đầu tiên
              </button>
            )}
          </div>
        )}
      </div>

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
  );
};

export default UserList;
