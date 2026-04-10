import React, { useState } from 'react';
import { User } from '../../services/userService';

// ========================================
// BULK ACTIONS COMPONENT
// ========================================

interface BulkActionsProps {
  selectedUsers: User[];
  onBulkRoleChange: (role: string) => Promise<void>;
  onBulkStatusChange: (isActive: boolean) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onClearSelection: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedUsers,
  onBulkRoleChange,
  onBulkStatusChange,
  onBulkDelete,
  onClearSelection
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (selectedUsers.length === 0) return null;

  const handleBulkRoleChange = async (role: string) => {
    setShowRoleMenu(false);
    await onBulkRoleChange(role);
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    setShowStatusMenu(false);
    await onBulkStatusChange(isActive);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    await onBulkDelete();
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white dark:bg-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] border-t border-slate-200 dark:border-slate-700 z-40 p-4 transition-transform duration-300">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center min-w-[2rem] h-8 px-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-full font-bold text-sm">
              {selectedUsers.length}
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">người dùng được chọn</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Change */}
            <div className="relative">
              <button
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
              >
                🔄 Đổi vai trò
              </button>
              {showRoleMenu && (
                <div className="absolute bottom-full left-0 md:left-auto md:right-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden py-1 z-50">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleBulkRoleChange('Admin')}
                  >
                    👑 Đổi thành Admin
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleBulkRoleChange('Staff')}
                  >
                    👤 Đổi thành Staff
                  </button>
                </div>
              )}
            </div>

            {/* Status Change */}
            <div className="relative">
              <button
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
              >
                🔒 Thay đổi trạng thái
              </button>
              {showStatusMenu && (
                <div className="absolute bottom-full left-0 md:left-auto md:right-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden py-1 z-50">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleBulkStatusChange(true)}
                  >
                    ✅ Kích hoạt tất cả
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleBulkStatusChange(false)}
                  >
                    ⛔ Vô hiệu hóa tất cả
                  </button>
                </div>
              )}
            </div>

            {/* Delete */}
            <button
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              onClick={() => setShowConfirm(true)}
            >
              🗑️ Xóa ({selectedUsers.length})
            </button>

            {/* Clear Selection */}
            <button
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              onClick={onClearSelection}
            >
              ✖ Hủy chọn
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="bg-rose-50 dark:bg-rose-900/30 p-4 border-b border-rose-100 dark:border-rose-800/50">
              <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                ⚠️ Xác nhận hành động
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-700 dark:text-slate-200 text-sm">
                Bạn có chắc chắn muốn xóa <strong className="font-bold">{selectedUsers.length}</strong> người dùng?
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto space-y-2">
                {selectedUsers.slice(0, 5).map(user => (
                  <div key={user.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{user.fullName}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">({user.role})</span>
                  </div>
                ))}
                {selectedUsers.length > 5 && (
                  <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 italic border-t border-slate-200 dark:border-slate-700">
                    và {selectedUsers.length - 5} người khác...
                  </div>
                )}
              </div>
              
              <p className="text-rose-600 dark:text-rose-400 text-sm font-medium pt-2">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                onClick={() => setShowConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-white bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:ring-rose-500/30 transition-colors"
                onClick={handleConfirmDelete}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ========================================
// SELECT ALL CHECKBOX COMPONENT
// ========================================

interface SelectAllCheckboxProps {
  totalUsers: number;
  selectedCount: number;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const SelectAllCheckbox: React.FC<SelectAllCheckboxProps> = ({
  totalUsers,
  selectedCount,
  onSelectAll,
  onClearAll
}) => {
  const isAllSelected = selectedCount === totalUsers && totalUsers > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalUsers;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
          onChange={() => isAllSelected ? onClearAll() : onSelectAll()}
          className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 dark:checked:bg-indigo-500 transition-colors cursor-pointer"
        />
      </div>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
        {isAllSelected
          ? `Bỏ chọn tất cả (${selectedCount})`
          : isIndeterminate
          ? `${selectedCount} được chọn`
          : 'Chọn tất cả'}
      </label>
    </div>
  );
};

// ========================================
// USER ROW CHECKBOX COMPONENT
// ========================================

interface UserRowCheckboxProps {
  user: User;
  isSelected: boolean;
  onToggle: (user: User) => void;
  disabled?: boolean;
}

export const UserRowCheckbox: React.FC<UserRowCheckboxProps> = ({
  user,
  isSelected,
  onToggle,
  disabled = false
}) => {
  return (
    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(user)}
          disabled={disabled}
          title={disabled ? 'Không thể chọn tài khoản của bạn' : undefined}
          className={`w-4 h-4 rounded border-slate-300 focus:ring-indigo-500 focus:ring-2 transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-indigo-600 bg-white dark:bg-slate-700 dark:border-slate-600 dark:checked:bg-indigo-500'}`}
        />
      </div>
    </td>
  );
};
