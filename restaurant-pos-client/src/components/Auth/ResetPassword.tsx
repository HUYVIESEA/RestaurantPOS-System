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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 animate-fade-in-up text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30">
            <i className="fas fa-xmark text-2xl text-red-600 dark:text-red-400"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Link không hợp lệ</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{error || 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'}</p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Link 
              to="/forgot-password" 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Yêu cầu link mới
            </Link>
            <Link 
              to="/login" 
              className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 animate-fade-in-up">
        <div className="text-center">
          <img 
            src="/restaurant.png" 
            alt="Smart Order POS" 
            className="mx-auto h-16 w-auto object-contain mb-2"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Smart Order POS</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {success ? (
          <div className="text-center space-y-6 pt-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
              <i className="fas fa-check text-2xl text-green-600 dark:text-green-400"></i>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Đặt lại mật khẩu thành công!</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Mật khẩu của bạn đã được cập nhật.</p>
            </div>
            <div className="flex items-center justify-center text-sm text-blue-600 dark:text-blue-400 animate-pulse">
              <i className="fas fa-circle-notch fa-spin mr-2"></i> Đang chuyển hướng đến trang đăng nhập...
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md animate-shake">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Xác nhận mật khẩu *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                }`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2 mt-0.5"></i>
                    Đang xử lý...
                  </>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 dark:border-slate-700 pt-6">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors inline-flex items-center">
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
