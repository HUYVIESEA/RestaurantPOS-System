import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService, CreateUserRequest, UpdateUserRequest } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import './UserForm.css';

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useToast();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'Staff' as 'Admin' | 'Staff',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
 if (isEditMode && id) {
      fetchUser();
    }
  }, [id, isEditMode]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const user = await userService.getById(parseInt(id!));
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        password: '',
        confirmPassword: '',
        role: user.role as 'Admin' | 'Staff',
      });
    } catch (err) {
      console.error('Error fetching user:', err);
  showError('Không thể tải thông tin người dùng');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

  // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    // Password validation (only for create mode)
    if (!isEditMode) {
 if (!formData.password) {
        newErrors.password = 'Mật khẩu không được để trống';
      } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

   if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setLoading(true);

   if (isEditMode) {
      const updateData: UpdateUserRequest = {
          username: formData.username,
          email: formData.email,
   fullName: formData.fullName,
        };
  await userService.update(parseInt(id!), updateData);
 
        // Update role separately if changed
        await userService.updateRole(parseInt(id!), formData.role);
    
        showSuccess('Cập nhật người dùng thành công!');
 } else {
        const createData: CreateUserRequest = {
    username: formData.username,
          email: formData.email,
        fullName: formData.fullName,
          password: formData.password,
 role: formData.role,
        };
        await userService.create(createData);
        showSuccess('Tạo người dùng thành công!');
      }

      navigate('/users');
    } catch (err: any) {
      console.error('Error saving user:', err);
      const errorMessage = err.response?.data || 'Không thể lưu thông tin người dùng';
      showError(errorMessage);
    } finally {
      setLoading(false);
  }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading && isEditMode) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="user-form-container">
      <div className="form-header">
     <h2>{isEditMode ? '✏️ Sửa người dùng' : '➕ Thêm người dùng mới'}</h2>
     <button className="btn btn-back" onClick={() => navigate('/users')}>
          ← Quay lại
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">
              Tên đăng nhập <span className="required">*</span>
            </label>
            <input
      type="text"
id="username"
    name="username"
       value={formData.username}
     onChange={handleChange}
              className={errors.username ? 'error' : ''}
   disabled={isEditMode} // Can't change username in edit mode
           placeholder="johndoe"
       />
  {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          {/* Email */}
<div className="form-group">
        <label htmlFor="email">
    Email <span className="required">*</span>
     </label>
         <input
          type="email"
              id="email"
  name="email"
              value={formData.email}
     onChange={handleChange}
         className={errors.email ? 'error' : ''}
   placeholder="user@example.com"
         />
       {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

          {/* Full Name */}
    <div className="form-group">
            <label htmlFor="fullName">
            Họ và tên <span className="required">*</span>
    </label>
       <input
 type="text"
       id="fullName"
           name="fullName"
       value={formData.fullName}
    onChange={handleChange}
  className={errors.fullName ? 'error' : ''}
         placeholder="Nguyễn Văn A"
          />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          {/* Role */}
       <div className="form-group">
 <label htmlFor="role">
        Vai trò <span className="required">*</span>
         </label>
            <select
    id="role"
          name="role"
            value={formData.role}
         onChange={handleChange}
            >
     <option value="Staff">👤 Staff</option>
              <option value="Admin">👑 Admin</option>
      </select>
          </div>

          {/* Password fields (only for create mode) */}
        {!isEditMode && (
            <>
              <div className="form-group">
     <label htmlFor="password">
         Mật khẩu <span className="required">*</span>
  </label>
  <input
         type="password"
       id="password"
 name="password"
                  value={formData.password}
         onChange={handleChange}
       className={errors.password ? 'error' : ''}
           placeholder="••••••••"
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
            <small className="help-text">Mật khẩu phải có ít nhất 6 ký tự</small>
         </div>

      <div className="form-group">
      <label htmlFor="confirmPassword">
      Xác nhận mật khẩu <span className="required">*</span>
                </label>
      <input
  type="password"
                  id="confirmPassword"
    name="confirmPassword"
              value={formData.confirmPassword}
    onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
    placeholder="••••••••"
     />
    {errors.confirmPassword && (
        <span className="error-message">{errors.confirmPassword}</span>
  )}
              </div>
      </>
        )}

          {/* Form Actions */}
       <div className="form-actions">
   <button
              type="button"
              className="btn btn-secondary"
          onClick={() => navigate('/users')}
     disabled={loading}
            >
        Hủy
  </button>
            <button
          type="submit"
              className="btn btn-primary"
   disabled={loading}
            >
              {loading ? 'Đang lưu...' : isEditMode ? '💾 Cập nhật' : '✓ Tạo người dùng'}
    </button>
          </div>
 </form>
  </div>
    </div>
  );
};

export default UserForm;
