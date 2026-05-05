import React, { useState, useEffect } from 'react';
import { vietQRService, PaymentSettings, UpdatePaymentSettingsRequest } from '../../services/vietQRService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}

const PaymentSettingsPage: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  // Form state
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load banks
      const token = localStorage.getItem('token');
      const banksRes = await axios.get(`${API_URL}/VietQR/banks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bankList = banksRes.data?.data || banksRes.data || [];
      setBanks(bankList);

      // Load current settings
      try {
        const settingsData = await vietQRService.getPaymentSettings();
        setSettings(settingsData);
        if (settingsData?.isConfigured) {
          setAccountNumber(settingsData.accountNumber || '');
          setAccountName(settingsData.accountName || '');
          // Find matching bank
          if (settingsData.bankBin) {
            const found = bankList.find((b: Bank) => b.bin === settingsData.bankBin);
            if (found) {
              setSelectedBank(found);
              setSearchTerm(found.shortName || found.short_name || found.name);
            }
          }
        }
      } catch {
        // No settings yet - that's OK
      }
    } catch (err) {
      console.error('Error loading payment data:', err);
      setMessage({ type: 'error', text: 'Không thể tải dữ liệu thanh toán' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setSearchTerm(bank.shortName || bank.short_name || bank.name);
    setShowBankDropdown(false);
  };

  const filteredBanks = banks.filter(b => {
    const term = searchTerm.toLowerCase();
    return (b.name?.toLowerCase().includes(term) ||
            b.shortName?.toLowerCase().includes(term) ||
            b.short_name?.toLowerCase().includes(term) ||
            b.code?.toLowerCase().includes(term));
  });

  const canSave = selectedBank && accountNumber.trim() && accountName.trim() && password.trim();

  const handleSave = async () => {
    if (!selectedBank || !canSave) return;

    setSaving(true);
    setMessage(null);

    try {
      const request: UpdatePaymentSettingsRequest = {
        bankName: selectedBank.shortName || selectedBank.short_name || selectedBank.name,
        bankBin: selectedBank.bin,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        password: password,
      };

      await vietQRService.updateSettings(request);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thanh toán thành công!' });
      setPassword(''); // Clear password
      setSettings({
        isConfigured: true,
        bankName: request.bankName,
        bankBin: request.bankBin,
        accountNumber: request.accountNumber,
        accountName: request.accountName,
      });
    } catch (err: unknown) {
      const errorMsg = (err instanceof Error) ? err.message : 
        (axios.isAxiosError(err) && err.response?.data?.message) ? err.response.data.message :
        'Lỗi khi cập nhật thanh toán';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Đang tải cấu hình thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <i className="fas fa-credit-card text-white"></i>
          </div>
          Cấu hình thanh toán
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Thiết lập thông tin ngân hàng để nhận thanh toán qua mã QR (VietQR)
        </p>
      </div>

      {/* Status Banner */}
      {settings?.isConfigured ? (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <i className="fas fa-check text-white text-sm"></i>
          </div>
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">Đã cấu hình</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {settings.bankName} — {settings.accountNumber} — {settings.accountName}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
            <i className="fas fa-exclamation text-white text-sm"></i>
          </div>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">Chưa cấu hình</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Vui lòng thiết lập thông tin ngân hàng để sử dụng tính năng thanh toán QR
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{message.text}</span>
          <button className="ml-auto" onClick={() => setMessage(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="fas fa-university text-blue-500"></i>
            Thông tin ngân hàng
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Bank Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngân hàng <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center gap-3">
                {selectedBank?.logo && (
                  <img src={selectedBank.logo} alt="" className="w-8 h-8 rounded object-contain bg-white border" />
                )}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowBankDropdown(true);
                    if (!e.target.value) setSelectedBank(null);
                  }}
                  onFocus={() => setShowBankDropdown(true)}
                  placeholder="Tìm kiếm ngân hàng..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              {showBankDropdown && filteredBanks.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredBanks.slice(0, 20).map((bank) => (
                    <button
                      key={bank.bin || bank.id}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                      onClick={() => handleSelectBank(bank)}
                    >
                      {bank.logo && (
                        <img src={bank.logo} alt="" className="w-8 h-8 rounded object-contain bg-white border shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {bank.shortName || bank.short_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{bank.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản ngân hàng"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên chủ tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              placeholder="VD: NGUYEN VAN A"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none uppercase"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700"></div>

          {/* Password for Verification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mật khẩu xác nhận <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu đăng nhập để xác nhận"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              <i className="fas fa-shield-alt mr-1"></i>
              Nhập mật khẩu đăng nhập để xác minh danh tính trước khi cập nhật
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            <i className="fas fa-lock mr-1"></i> Thông tin được mã hóa và bảo mật
          </p>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center gap-2 ${
              canSave && !saving
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {settings?.isConfigured ? 'Cập nhật' : 'Lưu cấu hình'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview QR Info */}
      {settings?.isConfigured && (
        <div className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            <i className="fas fa-qrcode mr-2"></i> Xem trước mã QR
          </h3>
          <div className="flex flex-col items-center gap-4">
            <img 
              src={`https://img.vietqr.io/image/${settings.bankBin}-${settings.accountNumber}-compact.png?amount=10000&addInfo=Test&accountName=${encodeURIComponent(settings.accountName)}`}
              alt="QR Preview"
              className="w-48 h-48 rounded-xl border border-gray-200 dark:border-gray-600 bg-white object-contain"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Mã QR mẫu (10.000đ) — Mã thật sẽ tự động tạo khi thanh toán
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettingsPage;
