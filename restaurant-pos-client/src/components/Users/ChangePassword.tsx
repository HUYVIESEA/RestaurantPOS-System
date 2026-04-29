import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import { AUTH_MESSAGES, COMMON_MESSAGES } from '../../constants/messages';

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
    showError(COMMON_MESSAGES.FORM_INVALID);
      return;
    }

    try {
      setLoading(true);
    
      await userService.changePassword({
   oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      showSuccess(AUTH_MESSAGES.PASSWORD_CHANGE_SUCCESS);
      
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
      const errorMessage = err.response?.data || AUTH_MESSAGES.PASSWORD_CHANGE_ERROR;
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
    <div className="p-6 w-full flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-500 text-2xl mb-4 shadow-sm">
            <i className="fas fa-key"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Đổi mật khẩu</h2>
          <p className="text-slate-500 dark:text-slate-400">Cập nhật mật khẩu của bạn để bảo mật tài khoản</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Current Password */}
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <i className="fas fa-lock text-slate-400"></i> Mật khẩu hiện tại
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className={`w-full pl-4 pr-12 py-2.5 rounded-lg border ${errors.oldPassword ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => togglePasswordVisibility('old')}
              >
                <i className={`fas ${showPasswords.old ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.oldPassword && <span className="text-sm text-rose-500 mt-1 block">{errors.oldPassword}</span>}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <i className="fas fa-lock text-slate-400"></i> Mật khẩu mới
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full pl-4 pr-12 py-2.5 rounded-lg border ${errors.newPassword ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => togglePasswordVisibility('new')}
              >
                <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.newPassword && <span className="text-sm text-rose-500 mt-1 block">{errors.newPassword}</span>}
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-3">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300" 
                    style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                  ></div>
                </div>
                <span className="text-xs font-medium mt-1 block" style={{ color: passwordStrength.color }}>
                  {passwordStrength.strength}
                </span>
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Mật khẩu phải có ít nhất 6 ký tự</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <i className="fas fa-lock text-slate-400"></i> Xác nhận mật khẩu mới
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-4 pr-12 py-2.5 rounded-lg border ${errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.confirmPassword && <span className="text-sm text-rose-500 mt-1 block">{errors.confirmPassword}</span>}
          </div>

          {/* Security Tips */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 mt-6">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <i className="fas fa-shield-alt text-blue-600"></i> Mẹo bảo mật:
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-blue-600 mt-0.5"></i>
                <span>Sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-blue-600 mt-0.5"></i>
                <span>Tránh sử dụng thông tin cá nhân dễ đoán</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-blue-600 mt-0.5"></i>
                <span>Không chia sẻ mật khẩu với người khác</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-blue-600 mt-0.5"></i>
                <span>Thay đổi mật khẩu định kỳ</span>
              </li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700 mt-8">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              <i className="fas fa-xmark"></i> Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
