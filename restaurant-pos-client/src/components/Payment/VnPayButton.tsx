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
      className={`inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#005C97] to-[#363795] hover:opacity-90 active:opacity-100 text-white border-none rounded-xl font-bold cursor-pointer transition-all duration-300 shadow-md shadow-blue-900/30 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-wait w-full sm:w-auto ${className}`}
    >
      {loading ? (
        <>
          <i className="fas fa-spinner fa-spin text-lg"></i> Đang xử lý...
        </>
      ) : (
        <>
          <i className="fas fa-wallet text-lg"></i> Thanh toán VNPay
        </>
      )}
    </button>
  );
};

export default VnPayButton;