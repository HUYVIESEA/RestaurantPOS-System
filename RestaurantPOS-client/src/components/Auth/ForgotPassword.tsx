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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-700 animate-fade-in-up">
        <div className="text-center mb-8">
          <img 
            src="/restaurant.png" 
            alt="Smart Order POS" 
            className="mx-auto h-20 w-auto object-contain mb-6 drop-shadow-sm"
          />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Quên mật khẩu</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
              <i className="fas fa-check text-2xl text-green-600 dark:text-green-400"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Email đã được gửi!</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 text-sm text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
              <p><i className="fas fa-envelope mr-2"></i> Vui lòng kiểm tra hộp thư của bạn (và cả thư mục spam)</p>
            </div>
            <Link 
              to="/login" 
              className="inline-flex justify-center items-center w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i> Quay lại đăng nhập
            </Link>
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
            
            {message && !success && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="block w-full px-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 sm:text-sm bg-white dark:bg-slate-700/50 transition-all hover:border-slate-300 dark:hover:border-slate-500"
                  required
                  autoFocus
                />
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
                      Đang gửi...
                    </span>
                  ) : (
                    'Gửi link đặt lại mật khẩu'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center flex flex-col gap-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nhớ mật khẩu?{' '}
                <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-600 dark:text-blue-500 transition-colors">
                  Đăng nhập
                </Link>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-600 dark:text-blue-500 transition-colors">
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
