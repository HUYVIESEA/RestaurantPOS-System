import React, { useEffect, useState } from 'react';
import { vietQRService, PaymentSettings } from '../../services/vietQRService';
import { useToast } from '../../contexts/ToastContext';

interface VietQRViewProps {
  amount: number;
  description: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

const VietQRView: React.FC<VietQRViewProps> = ({ amount, description, onSuccess, onCancel }) => {
  const { showError, showWarning } = useToast();
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    loadQR();
  }, []);

  const loadQR = async () => {
    try {
      setLoading(true);
      // 1. Get Settings
      const settingsData = await vietQRService.getPaymentSettings();
      setSettings(settingsData);

      if (!settingsData.isConfigured) {
        showWarning('Chưa cấu hình tài khoản ngân hàng nhận tiền.');
        return;
      }

      // 2. Generate QR
      const response = await vietQRService.generateQR({
        bankBin: settingsData.bankBin,
        accountNumber: settingsData.accountNumber,
        accountName: settingsData.accountName,
        amount: amount,
        description: description
      });

      setQrUrl(response.qrUrl);

    } catch (err) {
      console.error('Error loading VietQR:', err);
      showError('Không thể tạo mã QR thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm min-h-[400px]">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
        <p className="text-slate-600 dark:text-slate-300 font-medium">Đang tạo mã QR...</p>
      </div>
    );
  }

  if (!settings?.isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm min-h-[400px]">
        <i className="fas fa-exclamation-circle text-5xl text-amber-500 mb-4"></i>
        <p className="text-slate-800 dark:text-white font-medium mb-6 text-center">Chưa cấu hình tài khoản nhận tiền.</p>
        <button 
          className="w-full sm:w-auto px-8 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-medium transition-colors"
          onClick={onCancel}
        >
          Đóng
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm max-w-md mx-auto w-full border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
        <img src="https://vietqr.net/img/logo.png" alt="VietQR" className="h-6 object-contain brightness-0 dark:invert" />
        <h4 className="text-lg font-semibold text-slate-800 dark:text-white m-0">Thanh toán</h4>
      </div>

      <div className="p-6 flex flex-col items-center">
        {qrUrl ? (
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 mb-6">
            <img src={qrUrl} alt="VietQR Payment Code" className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-lg" />
          </div>
        ) : (
          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-6 text-slate-500 dark:text-slate-400">
            Không thể tải mã QR
          </div>
        )}

        <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 space-y-3 text-sm sm:text-base border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start gap-4">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Ngân hàng:</span>
            <strong className="text-slate-800 dark:text-white text-right break-words">{settings.bankName}</strong>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">STK:</span>
            <strong className="text-slate-800 dark:text-white text-right break-words tracking-widest">{settings.accountNumber}</strong>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Chủ TK:</span>
            <strong className="text-slate-800 dark:text-white text-right break-words uppercase">{settings.accountName}</strong>
          </div>
          <div className="flex justify-between items-start gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Số tiền:</span>
            <strong className="text-blue-600 dark:text-blue-400 text-lg text-right break-words">{amount.toLocaleString('vi-VN')} đ</strong>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Nội dung:</span>
            <strong className="text-slate-800 dark:text-white text-right break-words">{description}</strong>
          </div>
        </div>

        <p className="text-sm text-amber-600 dark:text-amber-400 text-center mb-6 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl w-full flex items-center justify-center">
          <i className="fas fa-info-circle mr-2"></i>
          Sau khi chuyển khoản thành công, nhấn "Đã thanh toán" để hoàn tất.
        </p>

        <div className="flex flex-col w-full gap-3">
          <button 
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/20 flex items-center justify-center gap-2"
            onClick={onSuccess}
          >
            <i className="fas fa-circle-check text-lg"></i> Đã thanh toán
          </button>
          <button 
            className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-slate-500/20 flex items-center justify-center gap-2"
            onClick={onCancel}
          >
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default VietQRView;