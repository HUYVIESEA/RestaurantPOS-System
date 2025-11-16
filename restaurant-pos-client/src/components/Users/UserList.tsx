import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, User } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonTable } from '../Common/Skeleton'; // ✅ ADD
import './UserList.css';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'Staff'>('all');
  
  // Get current user ID from auth context
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

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? 'vô hiệu hóa' : 'kích hoạt';
    if (!window.confirm(`Bạn có chắc muốn ${action} người dùng này?`)) return;

    try {
      await userService.updateStatus(id, !currentStatus);
      await fetchUsers();
      showSuccess(`Đã ${action} người dùng thành công`);
    } catch (err: any) {
      console.error('Error toggling status:', err);
      showError(err.response?.data || `Không thể ${action} người dùng`);
    }
  };

  const handleChangeRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === 'Admin' ? 'Staff' : 'Admin';
    if (!window.confirm(`Đổi vai trò thành ${newRole}?`)) return;

    try {
      await userService.updateRole(id, newRole);
      await fetchUsers();
      showSuccess(`Đã đổi vai trò thành ${newRole}`);
    } catch (err) {
      console.error('Error changing role:', err);
      showError('Không thể đổi vai trò');
    }
  };

  const handleResetPassword = async (id: number, username: string) => {
    if (!window.confirm(`Reset mật khẩu cho ${username}?`)) return;

    try {
  const result = await userService.resetPassword(id);
   alert(`Mật khẩu mới: ${result.newPassword}\n\nHãy lưu lại và gửi cho người dùng!`);
showSuccess('Đã reset mật khẩu thành công');
    } catch (err) {
      console.error('Error resetting password:', err);
      showError('Không thể reset mật khẩu');
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${username}"?`)) return;

    try {
      await userService.delete(id);
      await fetchUsers();
      showSuccess('Đã xóa người dùng thành công');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showError(err.response?.data || 'Không thể xóa người dùng');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
  const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="user-list-container">
   <div className="header">
          <h2><i className="fas fa-users"></i> Quản lý Người dùng</h2>
        </div>
   <SkeletonTable rows={5} columns={7} />
      </div>
    );
  }
  
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="user-list-container">
      <div className="header">
   <div className="header-left">
          <h2><i className="fas fa-users"></i> Quản lý Người dùng</h2>
 <span className="user-count">{filteredUsers.length} người dùng</span>
 </div>
        <button className="btn btn-primary" onClick={() => navigate('/users/new')}>
      <i className="fas fa-plus"></i> Thêm người dùng
        </button>
      </div>

      <div className="toolbar">
    <div className="search-box">
     <i className="fas fa-search"></i>
   <input
 type="text"
         placeholder="Tìm kiếm theo tên, email..."
        value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
  />
     {searchTerm && (
   <button className="clear-search" onClick={() => setSearchTerm('')}>
     <i className="fas fa-times"></i>
     </button>
   )}
        </div>

        <div className="role-filters">
    <button
  className={`filter-chip ${roleFilter === 'all' ? 'active' : ''}`}
      onClick={() => setRoleFilter('all')}
    >
          <i className="fas fa-th-large"></i>
       Tất cả
 <span className="count">{users.length}</span>
   </button>
  <button
  className={`filter-chip ${roleFilter === 'Admin' ? 'active' : ''}`}
     onClick={() => setRoleFilter('Admin')}
          >
       <i className="fas fa-crown"></i>
  Admin
       <span className="count">{users.filter(u => u.role === 'Admin').length}</span>
       </button>
     <button
       className={`filter-chip ${roleFilter === 'Staff' ? 'active' : ''}`}
   onClick={() => setRoleFilter('Staff')}
   >
          <i className="fas fa-user"></i>
 Staff
 <span className="count">{users.filter(u => u.role === 'Staff').length}</span>
</button>
        </div>
      </div>

      <div className="users-table-container">
     <table className="users-table">
          <thead>
      <tr>
          <th>Tên đăng nhập</th>
     <th>Họ tên</th>
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
     onClick={() => handleChangeRole(user.id, user.role)}
      disabled={user.id === currentUserId}
      title="Đổi vai trò"
         >
      🔄
        </button>
      <button
      className="btn btn-sm btn-info"
     onClick={() => handleResetPassword(user.id, user.username)}
                 title="Reset mật khẩu"
            >
            🔑
       </button>
             <button
            className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
    onClick={() => handleToggleStatus(user.id, user.isActive)}
              disabled={user.id === currentUserId}
       title={user.isActive ? 'Khóa' : 'Kích hoạt'}
          >
             {user.isActive ? '🔒' : '🔓'}
        </button>
              <button
          className="btn btn-sm btn-delete"
       onClick={() => handleDelete(user.id, user.username)}
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
    </div>
  );
};

export default UserList;
