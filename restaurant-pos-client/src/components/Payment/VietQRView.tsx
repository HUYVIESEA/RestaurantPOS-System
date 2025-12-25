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
      <div className="vietqr-container loading">
        <i className="fas fa-spinner fa-spin fa-2x"></i>
        <p>Đang tạo mã QR...</p>
      </div>
    );
  }

  if (!settings?.isConfigured) {
    return (
      <div className="vietqr-container error">
        <i className="fas fa-exclamation-circle fa-2x text-warning"></i>
        <p>Chưa cấu hình tài khoản nhận tiền.</p>
        <button className="btn btn-secondary" onClick={onCancel}>Đóng</button>
      </div>
    );
  }

  return (
    <div className="vietqr-container">
      <div className="qr-header">
        <img src="https://vietqr.net/img/logo.png" alt="VietQR" className="vietqr-logo" style={{height: '30px'}} />
        <h4>Quét mã để thanh toán</h4>
      </div>

      {qrUrl ? (
        <div className="qr-image-wrapper">
          <img src={qrUrl} alt="VietQR Payment Code" className="qr-code-img" />
        </div>
      ) : (
        <div className="error-state">Không thể tải mã QR</div>
      )}

      <div className="payment-info">
        <div className="info-row">
          <span>Ngân hàng:</span>
          <strong>{settings.bankName}</strong>
        </div>
        <div className="info-row">
          <span>STK:</span>
          <strong>{settings.accountNumber}</strong>
        </div>
        <div className="info-row">
          <span>Chủ TK:</span>
          <strong>{settings.accountName}</strong>
        </div>
        <div className="info-row total">
          <span>Số tiền:</span>
          <strong className="amount">{amount.toLocaleString('vi-VN')} đ</strong>
        </div>
        <div className="info-row">
          <span>Nội dung:</span>
          <strong>{description}</strong>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={onCancel}>
            Quay lại
        </button>
        <button className="btn btn-success" onClick={onSuccess}>
            <i className="fas fa-check"></i> Đã thanh toán
        </button>
      </div>
      
      <p className="note">Sau khi chuyển khoản thành công, nhấn "Đã thanh toán" để hoàn tất đơn hàng.</p>
    </div>
  );
};

export default VietQRView;
