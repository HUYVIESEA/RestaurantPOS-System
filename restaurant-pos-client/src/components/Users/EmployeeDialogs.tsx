import React, { useState } from 'react';
import './EmployeeDialogs.css';

// ========================================
// CHANGE ROLE DIALOG
// ========================================
interface ChangeRoleDialogProps {
  isOpen: boolean;
  userName: string;
  currentRole: string;
  onConfirm: (newRole: string) => void;
  onCancel: () => void;
}

export const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({
  isOpen,
  userName,
  currentRole,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const newRole = currentRole === 'Admin' ? 'Staff' : 'Admin';

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content role-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header warning">
          <div className="dialog-icon">🔄</div>
          <h3>Thay đổi vai trò</h3>
        </div>

        <div className="dialog-body">
          <p className="dialog-message">
            Bạn có chắc muốn thay đổi vai trò của <strong>{userName}</strong>?
          </p>

          <div className="role-change-info">
            <div className="role-item current">
              <span className="role-label">Vai trò hiện tại:</span>
              <span className={`role-badge ${currentRole.toLowerCase()}`}>
                {currentRole === 'Admin' ? '👑 Admin' : '👤 Staff'}
              </span>
            </div>

            <div className="role-arrow">→</div>

            <div className="role-item new">
              <span className="role-label">Vai trò mới:</span>
              <span className={`role-badge ${newRole.toLowerCase()}`}>
                {newRole === 'Admin' ? '👑 Admin' : '👤 Staff'}
              </span>
            </div>
          </div>

          <div className="warning-note">
            <span className="warning-icon">⚠️</span>
            <p>
              {newRole === 'Admin' 
                ? 'Admin có quyền truy cập toàn bộ hệ thống và quản lý người dùng.'
                : 'Staff chỉ có quyền xem và cập nhật thông tin cơ bản.'}
            </p>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-cancel" onClick={onCancel}>
            Hủy
          </button>
          <button className="btn btn-warning" onClick={() => onConfirm(newRole)}>
            Xác nhận thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================
// RESET PASSWORD DIALOG
// ========================================
interface ResetPasswordDialogProps {
  isOpen: boolean;
  userName: string;
  newPassword?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showPassword: boolean;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  isOpen,
  userName,
  newPassword,
  onConfirm,
  onCancel,
  showPassword
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content password-dialog" onClick={(e) => e.stopPropagation()}>
        {!showPassword ? (
          // Confirmation step
          <>
            <div className="dialog-header info">
              <div className="dialog-icon">🔑</div>
              <h3>Reset mật khẩu</h3>
            </div>

            <div className="dialog-body">
              <p className="dialog-message">
                Bạn có chắc muốn reset mật khẩu cho <strong>{userName}</strong>?
              </p>

              <div className="warning-note">
                <span className="warning-icon">ℹ️</span>
                <p>
                  Mật khẩu mới sẽ được tạo tự động. Hãy lưu lại và gửi cho người dùng.
                </p>
              </div>
            </div>

            <div className="dialog-footer">
              <button className="btn btn-cancel" onClick={onCancel}>
                Hủy
              </button>
              <button className="btn btn-info" onClick={onConfirm}>
                Reset mật khẩu
              </button>
            </div>
          </>
        ) : (
          // Show new password
          <>
            <div className="dialog-header success">
              <div className="dialog-icon">✅</div>
              <h3>Mật khẩu mới</h3>
            </div>

            <div className="dialog-body">
              <p className="success-message">
                Đã reset mật khẩu thành công cho <strong>{userName}</strong>!
              </p>

              <div className="password-display">
                <label>Mật khẩu mới:</label>
                <div className="password-box">
                  <code className="password-code">{newPassword}</code>
                  <button 
                    className="btn-copy" 
                    onClick={handleCopy}
                    title="Copy mật khẩu"
                  >
                    {copied ? '✓ Đã copy' : '📋 Copy'}
                  </button>
                </div>
              </div>

              <div className="warning-note important">
                <span className="warning-icon">⚠️</span>
                <p>
                  <strong>Quan trọng:</strong> Hãy lưu lại mật khẩu này và gửi cho người dùng. 
                  Bạn sẽ không thể xem lại mật khẩu này sau khi đóng hộp thoại.
                </p>
              </div>
            </div>

            <div className="dialog-footer">
              <button className="btn btn-success" onClick={onCancel}>
                Đã lưu lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ========================================
// TOGGLE STATUS DIALOG
// ========================================
interface ToggleStatusDialogProps {
  isOpen: boolean;
  userName: string;
  currentStatus: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ToggleStatusDialog: React.FC<ToggleStatusDialogProps> = ({
  isOpen,
  userName,
  currentStatus,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const action = currentStatus ? 'vô hiệu hóa' : 'kích hoạt';
  const newStatus = !currentStatus;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content status-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`dialog-header ${currentStatus ? 'danger' : 'success'}`}>
          <div className="dialog-icon">{currentStatus ? '🔒' : '🔓'}</div>
          <h3>{currentStatus ? 'Vô hiệu hóa' : 'Kích hoạt'} tài khoản</h3>
        </div>

        <div className="dialog-body">
          <p className="dialog-message">
            Bạn có chắc muốn <strong>{action}</strong> tài khoản <strong>{userName}</strong>?
          </p>

          <div className="status-change-info">
            <div className="status-item current">
              <span className="status-label">Trạng thái hiện tại:</span>
              <span className={`status-badge ${currentStatus ? 'active' : 'inactive'}`}>
                {currentStatus ? '✅ Hoạt động' : '⛔ Đã khóa'}
              </span>
            </div>

            <div className="status-arrow">→</div>

            <div className="status-item new">
              <span className="status-label">Trạng thái mới:</span>
              <span className={`status-badge ${newStatus ? 'active' : 'inactive'}`}>
                {newStatus ? '✅ Hoạt động' : '⛔ Đã khóa'}
              </span>
            </div>
          </div>

          <div className="warning-note">
            <span className="warning-icon">ℹ️</span>
            <p>
              {currentStatus 
                ? 'Người dùng sẽ không thể đăng nhập vào hệ thống sau khi bị vô hiệu hóa.'
                : 'Người dùng sẽ có thể đăng nhập lại sau khi được kích hoạt.'}
            </p>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-cancel" onClick={onCancel}>
            Hủy
          </button>
          <button 
            className={`btn ${currentStatus ? 'btn-danger' : 'btn-success'}`} 
            onClick={onConfirm}
          >
            {currentStatus ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </button>
        </div>
      </div>
    </div>
  );
};
