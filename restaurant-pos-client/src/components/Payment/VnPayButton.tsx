import React, { useState } from 'react';
import { createPaymentUrl } from '../../services/paymentService';
import { useToast } from '../../contexts/ToastContext';

interface VnPayButtonProps {
  amount: number;
  orderDescription: string;
  orderType?: string;
  className?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: any) => void;
}

const VnPayButton: React.FC<VnPayButtonProps> = ({
  amount,
  orderDescription,
  orderType = 'other',
  className = '',
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handlePayment = async () => {
    try {
      setLoading(true);
      const result = await createPaymentUrl(amount, orderDescription, orderType);
      
      if (result && result.url) {
        if (onSuccess) {
          onSuccess(result.url);
        } else {
          // Mặc định chuyển hướng
          window.location.href = result.url;
        }
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Lỗi tạo giao dịch thanh toán', 'error');
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={loading}
      className={`btn-vnpay ${className}`}
      style={{
        background: 'linear-gradient(90deg, #005C97 0%, #363795 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '2rem',
        fontWeight: 'bold',
        cursor: loading ? 'wait' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(0, 92, 151, 0.3)'
      }}
    >
      {loading ? (
        <>
          <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
        </>
      ) : (
        <>
          <i className="fas fa-wallet"></i> Thanh toán VNPay
        </>
      )}
    </button>
  );
};

export default VnPayButton;
