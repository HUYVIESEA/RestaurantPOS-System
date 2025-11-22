import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../../services/paymentService';
import './PaymentResult.css';

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
    <div className="payment-result-container">
      <div className={`result-card ${status}`}>
        {status === 'loading' && (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <h2>Đang xử lý...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="success-content">
            <div className="icon-circle">
              <i className="fas fa-check"></i>
            </div>
            <h2>Thanh toán thành công!</h2>
            <p>{message}</p>
            <button className="btn-home" onClick={() => navigate('/orders')}>
              Về danh sách đơn hàng
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="error-content">
            <div className="icon-circle">
              <i className="fas fa-times"></i>
            </div>
            <h2>Thanh toán thất bại</h2>
            <p>{message}</p>
            <button className="btn-retry" onClick={() => navigate('/orders')}>
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
