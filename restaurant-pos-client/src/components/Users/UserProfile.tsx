import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, UpdateProfileRequest } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import { SkeletonProfile } from '../Common/Skeleton';
import { USER_MESSAGES, COMMON_MESSAGES } from '../../constants/messages';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
 fullName: '',
  role: '',
    createdAt: '',
    isActive: true,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
   const profile = await userService.getProfile();
      setFormData({
        username: profile.username,
  email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
      createdAt: profile.createdAt,
        isActive: profile.isActive,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      showError(USER_MESSAGES.PROFILE_LOAD_ERROR);
    } finally {
  setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
  showError(COMMON_MESSAGES.FORM_INVALID);
   return;
}

    try {
      setSaving(true);
      
   const updateData: UpdateProfileRequest = {
        email: formData.email,
        fullName: formData.fullName,
      };

      await userService.updateProfile(updateData);
  
      showSuccess(USER_MESSAGES.PROFILE_UPDATE_SUCCESS);
      setIsEditing(false);
      await fetchProfile();
    } catch (err: any) {
   console.error('Error updating profile:', err);
      const errorMessage = err.response?.data || USER_MESSAGES.PROFILE_UPDATE_ERROR;
      showError(errorMessage);
  } finally {
   setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
    setErrors({});
  };

  if (loading) {
    return <SkeletonProfile />; // ✅ Use skeleton instead of plain text
  }

  return (
    <div className="p-6 w-full space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Banner/Header background */}
        <div className="h-32 bg-blue-600"></div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-700 flex items-center justify-center text-6xl text-slate-300 dark:text-slate-500 shadow-md">
                <i className="fas fa-circle-user"></i>
              </div>
              <div className="text-center md:text-left mt-2 md:mt-16">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formData.fullName}</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-2">@{formData.username}</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${formData.role === 'Admin' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400' : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-900 dark:text-blue-500'}`}>
                  <i className={`fas ${formData.role === 'Admin' ? 'fa-crown' : 'fa-user'}`}></i>
                  {formData.role}
                </span>
              </div>
            </div>

            {!isEditing ? (
              <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                <button 
                  className="flex-1 md:flex-none px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-pen-to-square"></i> Chỉnh sửa
                </button>
                <button 
                  className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                  onClick={() => navigate('/change-password')}
                >
                  <i className="fas fa-key"></i> Đổi mật khẩu
                </button>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
                <i className="fas fa-user text-blue-600"></i> Thông tin cá nhân
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username - Read only */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                    <i className="fas fa-user text-slate-400"></i> Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tên đăng nhập không thể thay đổi</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                    <i className="fas fa-envelope text-slate-400"></i> Email
                    {isEditing && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} ${!isEditing ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'} focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                  />
                  {errors.email && <span className="text-sm text-rose-500 mt-1 block">{errors.email}</span>}
                </div>

                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                    <i className="fas fa-id-card text-slate-400"></i> Họ và tên
                    {isEditing && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} ${!isEditing ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'} focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                  />
                  {errors.fullName && <span className="text-sm text-rose-500 mt-1 block">{errors.fullName}</span>}
                </div>

                {/* Role - Read only */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                    <i className="fas fa-shield-alt text-slate-400"></i> Vai trò
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 cursor-not-allowed font-medium"
                  />
                </div>

                {/* Created At - Read only */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                    <i className="fas fa-calendar text-slate-400"></i> Ngày tạo
                  </label>
                  <input
                    type="text"
                    value={new Date(formData.createdAt).toLocaleDateString('vi-VN')}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 cursor-not-allowed"
                  />
                </div>

                {/* Status - Read only */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                    <i className="fas fa-circle-check text-slate-400"></i> Trạng thái
                  </label>
                  <div className="pt-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${formData.isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                      {formData.isActive ? '✅ Hoạt động' : '⛔ Khóa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <i className="fas fa-xmark"></i> Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
