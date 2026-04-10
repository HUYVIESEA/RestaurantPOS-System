import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../../services/paymentService';

const PaymentResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const queryParams = location.search;
        if (!queryParams) {
          setStatus('error');
          setMessage('Không tìm thấy thông tin giao dịch.');
          return;
        }

        const result = await verifyPayment(queryParams);
        if (result.success) {
          setStatus('success');
          setMessage('Giao dịch thành công!');
        } else {
          setStatus('error');
          setMessage(result.message || 'Giao dịch thất bại.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Lỗi kết nối đến hệ thống.');
      }
    };

    verify();
  }, [location]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center transition-all duration-300">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Đang xử lý...</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
              <i className="fas fa-check text-4xl text-emerald-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Thanh toán thành công!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8">{message}</p>
            <button 
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              onClick={() => navigate('/orders')}
            >
              Về danh sách đơn hàng
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
              <i className="fas fa-xmark text-4xl text-rose-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Thanh toán thất bại</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8">{message}</p>
            <button 
              className="w-full py-4 px-6 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-slate-500/20 mb-4"
              onClick={() => navigate('/orders')}
            >
              Về danh sách đơn hàng
            </button>
            <button 
              className="w-full py-4 px-6 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-rose-500/20"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
