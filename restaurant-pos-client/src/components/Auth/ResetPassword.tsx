import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateToken = useCallback(async () => {
    if (!token) {
      setError('Token không hợp lệ');
      setValidating(false);
      return;
    }

    try {
      await authService.validateResetToken(token);
      setTokenValid(true);
    } catch (err) {
      setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  }, [token]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token!, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center animate-scale-in">
          <div className="w-10 h-10 border-3 border-blue-100 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Đang xác thực link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid && !validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-700 animate-fade-in-up text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <i className="fas fa-xmark text-2xl text-red-600 dark:text-red-400"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Link không hợp lệ</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{error || 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'}</p>
          </div>
          <div className="pt-6 flex flex-col gap-3">
            <Link 
              to="/forgot-password" 
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors hover:shadow-md"
            >
              Yêu cầu link mới
            </Link>
            <Link 
              to="/login" 
              className="w-full flex justify-center py-3.5 px-4 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-700 animate-fade-in-up">
        
        {/* Header & Logo */}
        <div className="text-center mb-8">
          <img 
            src="/restaurant.png" 
            alt="Smart Order POS" 
            className="mx-auto h-20 w-auto object-contain mb-6 drop-shadow-sm"
          />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {success ? (
          <div className="text-center space-y-6 pt-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
              <i className="fas fa-check text-2xl text-green-600 dark:text-green-400"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Đặt lại mật khẩu thành công!</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Mật khẩu của bạn đã được cập nhật.</p>
            </div>
            <div className="flex items-center justify-center text-sm text-blue-700 dark:text-blue-500 animate-pulse">
              <i className="fas fa-circle-notch fa-spin mr-2"></i> Đang chuyển hướng đến trang đăng nhập...
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="block w-full px-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 sm:text-sm bg-white dark:bg-slate-700/50 transition-all hover:border-slate-300 dark:hover:border-slate-500"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="block w-full px-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 sm:text-sm bg-white dark:bg-slate-700/50 transition-all hover:border-slate-300 dark:hover:border-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : 'shadow-sm hover:shadow-md'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <i className="fas fa-circle-notch fa-spin"></i>
                      Đang xử lý...
                    </span>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
              <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-600 dark:text-blue-500 transition-colors inline-flex items-center">
                <i className="fas fa-arrow-left mr-2"></i> Quay lại đăng nhập
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
