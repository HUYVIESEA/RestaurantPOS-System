import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      setMessage('Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">Quên mật khẩu</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
              <i className="fas fa-check text-2xl text-green-600 dark:text-green-400"></i>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Email đã được gửi!</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
              <p><i className="fas fa-envelope mr-2"></i> Vui lòng kiểm tra hộp thư của bạn (và cả thư mục spam)</p>
            </div>
            <Link 
              to="/login" 
              className="inline-flex justify-center w-full px-4 py-3 border border-transparent text-sm font-semibold rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2 mt-0.5"></i> Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                </div>
              </div>
            )}
            
            {message && !success && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors"
                  required
                  autoFocus
                />
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
                    Đang gửi...
                  </>
                ) : (
                  'Gửi link đặt lại mật khẩu'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3 border-t border-gray-100 dark:border-slate-700 pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nhớ mật khẩu?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Đăng nhập
                </Link>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
