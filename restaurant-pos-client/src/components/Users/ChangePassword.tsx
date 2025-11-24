import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import './ChangePassword.css';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Old password validation
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    // New password validation
  if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (formData.newPassword === formData.oldPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
  }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
    
      await userService.changePassword({
   oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      showSuccess('Đổi mật khẩu thành công!');
      
    // Reset form
      setFormData({
        oldPassword: '',
        newPassword: '',
confirmPassword: '',
      });
   
      // Navigate back to profile after 1 second
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
      
    } catch (err: any) {
      console.error('Error changing password:', err);
      const errorMessage = err.response?.data || 'Không thể đổi mật khẩu';
      showError(errorMessage);
    } finally {
      setLoading(false);
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

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
    if (!password) return { strength: '', color: '', width: '0%' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { strength: 'Yếu', color: '#dc3545', width: '33%' };
    if (score <= 3) return { strength: 'Trung bình', color: '#ffc107', width: '66%' };
    return { strength: 'Mạnh', color: '#28a745', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="change-password-container">
  <div className="change-password-card">
        <div className="card-header">
      <div className="header-icon">
            <i className="fas fa-key"></i>
          </div>
          <h2>Đổi mật khẩu</h2>
          <p>Cập nhật mật khẩu của bạn để bảo mật tài khoản</p>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          {/* Current Password */}
 <div className="form-group">
    <label htmlFor="oldPassword">
   <i className="fas fa-lock"></i> Mật khẩu hiện tại
       <span className="required">*</span>
</label>
            <div className="password-input-wrapper">
  <input
     type={showPasswords.old ? 'text' : 'password'}
      id="oldPassword"
name="oldPassword"
                value={formData.oldPassword}
              onChange={handleChange}
  className={errors.oldPassword ? 'error' : ''}
      placeholder="Nhập mật khẩu hiện tại"
       />
              <button
        type="button"
    className="toggle-password"
   onClick={() => togglePasswordVisibility('old')}
         >
      <i className={`fas ${showPasswords.old ? 'fa-eye-slash' : 'fa-eye'}`}></i>
    </button>
            </div>
   {errors.oldPassword && <span className="error-message">{errors.oldPassword}</span>}
     </div>

    {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">
  <i className="fas fa-lock"></i> Mật khẩu mới
              <span className="required">*</span>
            </label>
    <div className="password-input-wrapper">
      <input
        type={showPasswords.new ? 'text' : 'password'}
      id="newPassword"
    name="newPassword"
        value={formData.newPassword}
        onChange={handleChange}
     className={errors.newPassword ? 'error' : ''}
     placeholder="Nhập mật khẩu mới"
              />
<button
        type="button"
       className="toggle-password"
          onClick={() => togglePasswordVisibility('new')}
     >
<i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
            </div>
          {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
            
      {/* Password Strength Indicator */}
{formData.newPassword && (
           <div className="password-strength">
             <div className="strength-bar">
                  <div 
            className="strength-fill" 
            style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
        ></div>
   </div>
        <span className="strength-text" style={{ color: passwordStrength.color }}>
 {passwordStrength.strength}
        </span>
  </div>
       )}
            <small className="help-text">Mật khẩu phải có ít nhất 6 ký tự</small>
          </div>

          {/* Confirm Password */}
      <div className="form-group">
        <label htmlFor="confirmPassword">
    <i className="fas fa-lock"></i> Xác nhận mật khẩu mới
     <span className="required">*</span>
            </label>
      <div className="password-input-wrapper">
<input
              type={showPasswords.confirm ? 'text' : 'password'}
      id="confirmPassword"
   name="confirmPassword"
      value={formData.confirmPassword}
             onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
     placeholder="Nhập lại mật khẩu mới"
  />
   <button
    type="button"
    className="toggle-password"
                onClick={() => togglePasswordVisibility('confirm')}
    >
       <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
      </button>
      </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

    {/* Security Tips */}
          <div className="security-tips">
  <h4><i className="fas fa-shield-alt"></i> Mẹo bảo mật:</h4>
      <ul>
  <li><i className="fas fa-check"></i> Sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
              <li><i className="fas fa-check"></i> Tránh sử dụng thông tin cá nhân dễ đoán</li>
              <li><i className="fas fa-check"></i> Không chia sẻ mật khẩu với người khác</li>
    <li><i className="fas fa-check"></i> Thay đổi mật khẩu định kỳ</li>
            </ul>
    </div>

    {/* Form Actions */}
          <div className="form-actions">
            <button
  type="button"
      className="btn btn-secondary"
         onClick={() => navigate('/profile')}
      disabled={loading}
       >
  <i className="fas fa-times"></i> Hủy
       </button>
            <button
      type="submit"
    className="btn btn-primary"
              disabled={loading}
            >
         {loading ? (
            <>
      <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
         </>
              ) : (
           <>
    <i className="fas fa-save"></i> Đổi mật khẩu
 </>
     )}
            </button>
       </div>
   </form>
      </div>
  </div>
  );
};

export default ChangePassword;
