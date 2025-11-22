import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, UpdateProfileRequest } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import { SkeletonProfile } from '../Common/Skeleton'; // ✅ ADD
import './UserProfile.css';

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
      showError('Không thể tải thông tin hồ sơ');
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
  showError('Vui lòng kiểm tra lại thông tin');
   return;
}

    try {
      setSaving(true);
      
   const updateData: UpdateProfileRequest = {
        email: formData.email,
        fullName: formData.fullName,
      };

      await userService.updateProfile(updateData);
  
      showSuccess('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
      await fetchProfile();
    } catch (err: any) {
   console.error('Error updating profile:', err);
      const errorMessage = err.response?.data || 'Không thể cập nhật hồ sơ';
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
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="header-content">
        <div className="avatar-large">
          <i className="fas fa-user-circle"></i>
          </div>
       <div className="header-info">
            <h2>{formData.fullName}</h2>
            <p className="username">@{formData.username}</p>
     <span className={`role-badge ${formData.role.toLowerCase()}`}>
     <i className={`fas ${formData.role === 'Admin' ? 'fa-crown' : 'fa-user'}`}></i>
      {formData.role}
            </span>
          </div>
        </div>
    <div className="header-actions">
        {!isEditing ? (
   <>
      <button 
            className="btn btn-primary"
       onClick={() => setIsEditing(true)}
   >
     <i className="fas fa-edit"></i> Chỉnh sửa
   </button>
   <button 
         className="btn btn-secondary"
       onClick={() => navigate('/change-password')}
      >
     <i className="fas fa-key"></i> Đổi mật khẩu
              </button>
      </>
          ) : null}
      </div>
      </div>

      <div className="profile-content">
      <form onSubmit={handleSubmit}>
          <div className="profile-section">
          <h3>
    <i className="fas fa-user"></i> Thông tin cá nhân
            </h3>
         
         <div className="form-grid">
    {/* Username - Read only */}
  <div className="form-group">
        <label>
        <i className="fas fa-user"></i> Tên đăng nhập
                </label>
           <input
            type="text"
       value={formData.username}
  disabled
           className="input-disabled"
        />
  <small className="help-text">Tên đăng nhập không thể thay đổi</small>
              </div>

  {/* Email */}
    <div className="form-group">
     <label>
     <i className="fas fa-envelope"></i> Email
            {isEditing && <span className="required">*</span>}
    </label>
          <input
    type="email"
       name="email"
          value={formData.email}
       onChange={handleChange}
      disabled={!isEditing}
          className={errors.email ? 'error' : ''}
     />
           {errors.email && <span className="error-message">{errors.email}</span>}
           </div>

  {/* Full Name */}
    <div className="form-group">
      <label>
     <i className="fas fa-id-card"></i> Họ và tên
    {isEditing && <span className="required">*</span>}
          </label>
   <input
                  type="text"
     name="fullName"
        value={formData.fullName}
    onChange={handleChange}
               disabled={!isEditing}
className={errors.fullName ? 'error' : ''}
 />
         {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>

   {/* Role - Read only */}
          <div className="form-group">
     <label>
      <i className="fas fa-shield-alt"></i> Vai trò
      </label>
            <input
         type="text"
  value={formData.role}
      disabled
       className="input-disabled"
       />
      </div>

              {/* Created At - Read only */}
       <div className="form-group">
 <label>
<i className="fas fa-calendar"></i> Ngày tạo
       </label>
     <input
     type="text"
        value={new Date(formData.createdAt).toLocaleDateString('vi-VN')}
  disabled
       className="input-disabled"
         />
       </div>

     {/* Status - Read only */}
              <div className="form-group">
          <label>
       <i className="fas fa-circle-check"></i> Trạng thái
      </label>
         <div className="status-display">
    <span className={`status-badge ${formData.isActive ? 'active' : 'inactive'}`}>
               {formData.isActive ? '✅ Hoạt động' : '⛔ Khóa'}
        </span>
          </div>
        </div>
   </div>
          </div>

          {/* Form Actions */}
{isEditing && (
    <div className="form-actions">
   <button
     type="button"
        className="btn btn-secondary"
      onClick={handleCancel}
          disabled={saving}
  >
  <i className="fas fa-times"></i> Hủy
              </button>
  <button
         type="submit"
     className="btn btn-primary"
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
  );
};

export default UserProfile;
