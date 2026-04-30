import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService, CreateUserRequest, UpdateUserRequest } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';

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

  // if (loading && isEditMode) {
  //   return <Loading message="Đang tải thông tin người dùng..." fullScreen={true} />;
  // }

  return (
    <div className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{isEditMode ? <><i className="fa-solid fa-pen mr-2"></i> Sửa người dùng</> : <><i className="fa-solid fa-plus mr-2"></i> Thêm người dùng mới</>}</h2>
        <button 
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2" 
          onClick={() => navigate('/users')}
        >
          ← Quay lại
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tên đăng nhập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.username ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800`}
              disabled={isEditMode}
              placeholder="johndoe"
            />
            {errors.username && <span className="text-sm text-rose-500 mt-1 block">{errors.username}</span>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
              placeholder="user@example.com"
            />
            {errors.email && <span className="text-sm text-rose-500 mt-1 block">{errors.email}</span>}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && <span className="text-sm text-rose-500 mt-1 block">{errors.fullName}</span>}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Vai trò <span className="text-rose-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors appearance-none"
            >
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Password fields (only for create mode) */}
          {!isEditMode && (
            <div className="space-y-6 pt-4 border-t dark:border-slate-700">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                  placeholder="••••••••"
                />
                {errors.password ? (
                  <span className="text-sm text-rose-500 mt-1 block">{errors.password}</span>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Mật khẩu phải có ít nhất 6 ký tự</span>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Xác nhận mật khẩu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <span className="text-sm text-rose-500 mt-1 block">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t dark:border-slate-700 mt-8">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              onClick={() => navigate('/users')}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : isEditMode ? <><i className="fa-solid fa-floppy-disk mr-1"></i> Cập nhật</> : <><i className="fa-solid fa-check mr-1"></i> Tạo người dùng</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;