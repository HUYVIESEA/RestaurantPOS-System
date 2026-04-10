import React, { useState } from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="bg-amber-50 dark:bg-amber-900/30 p-4 border-b border-amber-100 dark:border-amber-800/50">
          <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <span className="text-xl">🔄</span> Thay đổi vai trò
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-700 dark:text-slate-200 text-sm">
            Bạn có chắc muốn thay đổi vai trò của <strong className="font-bold">{userName}</strong>?
          </p>

          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Vai trò hiện tại:</span>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${currentRole === 'Admin' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400' : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'}`}>
                {currentRole === 'Admin' ? '👑 Admin' : '👤 Staff'}
              </span>
            </div>

            <div className="text-xl text-slate-400 dark:text-slate-500">→</div>

            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Vai trò mới:</span>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${newRole === 'Admin' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400' : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'}`}>
                {newRole === 'Admin' ? '👑 Admin' : '👤 Staff'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm rounded-lg border border-amber-100 dark:border-amber-800/50">
            <span className="text-lg">⚠️</span>
            <p>
              {newRole === 'Admin' 
                ? 'Admin có quyền truy cập toàn bộ hệ thống và quản lý người dùng.'
                : 'Staff chỉ có quyền xem và cập nhật thông tin cơ bản.'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={onCancel}>
            Hủy
          </button>
          <button className="px-4 py-2 rounded-lg font-medium text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:ring-amber-500/30 transition-colors" onClick={() => onConfirm(newRole)}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        {!showPassword ? (
          // Confirmation step
          <>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 border-b border-indigo-100 dark:border-indigo-800/50">
              <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <span className="text-xl">🔑</span> Reset mật khẩu
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-700 dark:text-slate-200 text-sm">
                Bạn có chắc muốn reset mật khẩu cho <strong className="font-bold">{userName}</strong>?
              </p>

              <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-lg border border-blue-100 dark:border-blue-800/50">
                <span className="text-lg">ℹ️</span>
                <p>
                  Mật khẩu mới sẽ được tạo tự động. Hãy lưu lại và gửi cho người dùng.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={onCancel}>
                Hủy
              </button>
              <button className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 transition-colors" onClick={onConfirm}>
                Reset mật khẩu
              </button>
            </div>
          </>
        ) : (
          // Show new password
          <>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 border-b border-emerald-100 dark:border-emerald-800/50">
              <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <span className="text-xl">✅</span> Mật khẩu mới
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                Đã reset mật khẩu thành công cho <strong className="font-bold">{userName}</strong>!
              </p>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mật khẩu mới:</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-lg text-slate-800 dark:text-slate-100 font-bold tracking-wider text-center">
                    {newPassword}
                  </code>
                  <button 
                    className={`px-4 py-3 rounded-lg font-medium transition-colors border ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'}`}
                    onClick={handleCopy}
                    title="Copy mật khẩu"
                  >
                    {copied ? '✓ Đã copy' : '📋 Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 text-sm rounded-lg border border-rose-100 dark:border-rose-800/50 mt-4">
                <span className="text-lg mt-0.5">⚠️</span>
                <p>
                  <strong>Quan trọng:</strong> Hãy lưu lại mật khẩu này và gửi cho người dùng. 
                  Bạn sẽ không thể xem lại mật khẩu này sau khi đóng hộp thoại.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button className="px-6 py-2 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/30 transition-colors w-full" onClick={onCancel}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className={`p-4 border-b ${currentStatus ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800/50 text-rose-700 dark:text-rose-400' : 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'}`}>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">{currentStatus ? '🔒' : '🔓'}</span> {currentStatus ? 'Vô hiệu hóa' : 'Kích hoạt'} tài khoản
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-700 dark:text-slate-200 text-sm">
            Bạn có chắc muốn <strong className="font-bold">{action}</strong> tài khoản <strong className="font-bold">{userName}</strong>?
          </p>

          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Trạng thái hiện tại:</span>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${currentStatus ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                {currentStatus ? '✅ Hoạt động' : '⛔ Đã khóa'}
              </span>
            </div>

            <div className="text-xl text-slate-400 dark:text-slate-500">→</div>

            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Trạng thái mới:</span>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${newStatus ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                {newStatus ? '✅ Hoạt động' : '⛔ Đã khóa'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-lg border border-blue-100 dark:border-blue-800/50">
            <span className="text-lg">ℹ️</span>
            <p>
              {currentStatus 
                ? 'Người dùng sẽ không thể đăng nhập vào hệ thống sau khi bị vô hiệu hóa.'
                : 'Người dùng sẽ có thể đăng nhập lại sau khi được kích hoạt.'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={onCancel}>
            Hủy
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium text-white transition-colors focus:ring-4 ${currentStatus ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/30' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/30'}`} 
            onClick={onConfirm}
          >
            {currentStatus ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </button>
        </div>
      </div>
    </div>
  );
};
