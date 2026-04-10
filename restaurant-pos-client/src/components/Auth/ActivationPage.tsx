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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 animate-fade-in-up">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                        <i className="fas fa-shield-alt text-3xl text-blue-600 dark:text-blue-400"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kích hoạt bản quyền</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Phần mềm chưa được kích hoạt cho thiết bị này.</p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-5 border border-gray-200 dark:border-slate-600">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mã hệ thống (System ID):
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-800 dark:text-gray-200 truncate select-all">
                            {systemId || 'Đang tải...'}
                        </div>
                        <button 
                            onClick={copySystemId} 
                            className="p-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            title="Sao chép"
                        >
                            <i className="fas fa-copy"></i>
                        </button>
                    </div>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        Vui lòng gửi mã này cho tác giả <strong className="text-gray-700 dark:text-gray-300">Hoàng Việt Huy</strong> để nhận mã kích hoạt.
                    </p>
                </div>

                <form onSubmit={handleActivate} className="mt-6 space-y-6">
                    <div>
                        <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nhập mã kích hoạt:
                        </label>
                        <input
                            type="text"
                            id="licenseKey"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono uppercase transition-colors"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !key.trim()}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                            (loading || !key.trim()) ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                        }`}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-circle-notch fa-spin mr-2 mt-0.5"></i>
                                Đang xử lý...
                            </>
                        ) : (
                            'Kích hoạt ngay'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 dark:border-slate-700 pt-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        © 2026 Hoàng Việt Huy. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ActivationPage;
