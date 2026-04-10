import React, { useState } from 'react';
import { useShift } from '../../contexts/ShiftContext';
import { formatCurrency } from '../../utils/priceUtils';

const ShiftWidget: React.FC = () => {
  const { activeShift, loading, startShift, closeShift } = useShift();
  const [isStarting, setIsStarting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [startingCash, setStartingCash] = useState<number | string>('');
  const [endingCash, setEndingCash] = useState<number | string>('');
  const [notes, setNotes] = useState('');

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse h-32 mb-6">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    );
  }

  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = typeof startingCash === 'string' ? parseFloat(startingCash) : startingCash;
    if (isNaN(amount) || amount < 0) return;
    
    const success = await startShift({ startingCash: amount, notes });
    if (success) {
      setIsStarting(false);
      setStartingCash('');
      setNotes('');
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = typeof endingCash === 'string' ? parseFloat(endingCash) : endingCash;
    if (isNaN(amount) || amount < 0) return;

    const success = await closeShift({ endingCash: amount, notes });
    if (success) {
      setIsClosing(false);
      setEndingCash('');
      setNotes('');
    }
  };

  if (!activeShift) {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-8 overflow-hidden text-white">
        {isStarting ? (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Mở ca làm việc mới</h3>
            <form onSubmit={handleStartShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-100">Tiền mặt đầu ca (VND) <span className="text-red-300">*</span></label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Ví dụ: 1000000"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-100">Ghi chú (Tuỳ chọn)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Ghi chú về ca làm việc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-colors"
                >
                  Bắt đầu ca
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsStarting(false)}
                  className="px-6 py-2 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                <i className="fas fa-lock"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold">Chưa mở ca làm việc</h3>
                <p className="text-indigo-100 mt-1">Bạn cần mở ca làm việc để bắt đầu thực hiện thanh toán và quản lý đơn hàng.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsStarting(true)}
              className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-md hover:bg-indigo-50 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <i className="fas fa-key"></i> Mở ca ngay
            </button>
          </div>
        )}
      </div>
    );
  }

  // Active Shift State
  return (
    <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl shadow-sm mb-8 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
      
      {isClosing ? (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <i className="fas fa-flag-checkered text-lg"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Đóng ca làm việc</h3>
          </div>
          
          <form onSubmit={handleCloseShift} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tiền mặt đầu ca</p>
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{formatCurrency(activeShift.startingCash)}</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Tiền mặt dự kiến (Hệ thống tính)</p>
                <p className="font-bold text-xl text-emerald-700 dark:text-emerald-300">{formatCurrency(activeShift.expectedCash || activeShift.startingCash)}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tiền mặt thực tế đếm được <span className="text-rose-500">*</span></label>
              <input 
                type="number" 
                required
                min="0"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nhập số tiền thực tế trong két..."
                value={endingCash}
                onChange={(e) => setEndingCash(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Ghi chú (Lý do chênh lệch nếu có)</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ghi chú chênh lệch..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
              >
                Xác nhận đóng ca
              </button>
              <button 
                type="button" 
                onClick={() => setIsClosing(false)}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
              <i className="fas fa-clock-rotate-left"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Đang trong ca làm việc</h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-md">ACTIVE</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bắt đầu lúc: <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(activeShift.startTime).toLocaleTimeString('vi-VN')}</span>
                <span className="mx-2">•</span>
                Nhân viên: <span className="font-medium text-slate-700 dark:text-slate-300">{activeShift.fullName || activeShift.userName}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full lg:w-auto gap-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tiền mặt đầu ca</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(activeShift.startingCash)}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tiền mặt dự kiến</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(activeShift.expectedCash || activeShift.startingCash)}</p>
            </div>
            <button 
              onClick={() => setIsClosing(true)}
              className="ml-2 px-4 py-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 font-medium rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-door-closed"></i> Đóng ca
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftWidget;
