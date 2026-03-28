import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import licenseService from '../../services/licenseService';
import { useToast } from '../../contexts/ToastContext';
import './ActivationPage.css';

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
        <div className="activation-container">
            <div className="activation-card">
                <div className="activation-header">
                    <i className="fas fa-shield-alt activation-icon"></i>
                    <h2>Kích hoạt bản quyền</h2>
                    <p>Phần mềm chưa được kích hoạt cho thiết bị này.</p>
                </div>

                <div className="system-id-section">
                    <label>Mã hệ thống (System ID):</label>
                    <div className="system-id-display">
                        <span>{systemId || 'Đang tải...'}</span>
                        <button onClick={copySystemId} className="copy-btn" title="Sao chép">
                            <i className="fas fa-copy"></i>
                        </button>
                    </div>
                    <p className="instruction">
                        Vui lòng gửi mã này cho tác giả <strong>(Hoàng Việt Huy)</strong> để nhận mã kích hoạt.
                    </p>
                </div>

                <form onSubmit={handleActivate} className="activation-form">
                    <div className="form-group">
                        <label htmlFor="licenseKey">Nhập mã kích hoạt:</label>
                        <input
                            type="text"
                            id="licenseKey"
                            className="form-control"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            required
                        />
                    </div>

                    <button type="submit" className="activate-btn" disabled={loading}>
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Kích hoạt ngay'}
                    </button>
                </form>

                <div className="activation-footer">
                    <p>© 2026 Hoàng Việt Huy. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default ActivationPage;
