import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import licenseService from '../../services/licenseService';
import { useToast } from '../../contexts/ToastContext';

const ActivationPage: React.FC = () => {
    const [key, setKey] = useState('');
    const [systemId, setSystemId] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        loadSystemInfo();
    }, []);

    const loadSystemInfo = async () => {
        try {
            const status = await licenseService.getStatus();
            if (status.isActivated) {
                navigate('/');
            }
            setSystemId(status.systemId);
        } catch (error) {
            console.error('Failed to load system info', error);
        }
    };

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!key.trim()) return;

        setLoading(true);
        try {
            await licenseService.activate(key);
            showToast('Kích hoạt thành công! Vui lòng khởi động lại ứng dụng.', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Mã kích hoạt không hợp lệ', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copySystemId = () => {
        navigator.clipboard.writeText(systemId);
        showToast('Đã sao chép System ID', 'info');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-700 animate-fade-in-up">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6 drop-shadow-sm">
                        <i className="fas fa-shield-alt text-2xl text-blue-700 dark:text-blue-500"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Kích hoạt bản quyền</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Phần mềm chưa được kích hoạt cho thiết bị này.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600 mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Mã hệ thống (System ID):
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 font-mono text-sm text-slate-800 dark:text-slate-200 truncate select-all">
                            {systemId || 'Đang tải...'}
                        </div>
                        <button 
                            onClick={copySystemId} 
                            className="p-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" 
                            title="Sao chép"
                        >
                            <i className="fas fa-copy"></i>
                        </button>
                    </div>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Vui lòng gửi mã này cho tác giả <strong className="text-slate-700 dark:text-slate-300">Hoàng Việt Huy</strong> để nhận mã kích hoạt.
                    </p>
                </div>

                <form onSubmit={handleActivate} className="space-y-6">
                    <div>
                        <label htmlFor="licenseKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Nhập mã kích hoạt <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="licenseKey"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            className="block w-full px-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 sm:text-sm bg-white dark:bg-slate-700/50 transition-all hover:border-slate-300 dark:hover:border-slate-500 font-mono uppercase"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading || !key.trim()}
                            className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors ${
                                (loading || !key.trim()) ? 'opacity-70 cursor-not-allowed' : 'shadow-sm hover:shadow-md'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <i className="fas fa-circle-notch fa-spin"></i>
                                    Đang xử lý...
                                </span>
                            ) : (
                                'Kích hoạt ngay'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        © 2026 Hoàng Việt Huy. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ActivationPage;
