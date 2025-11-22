import React, { useState } from 'react';
import { User } from '../../services/userService';
import './BulkActions.css';

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
      <div className="bulk-actions-bar">
        <div className="bulk-actions-left">
          <div className="selection-count">
            <span className="count-badge">{selectedUsers.length}</span>
            <span>người dùng được chọn</span>
          </div>
        </div>

        <div className="bulk-actions-buttons">
          {/* Role Change */}
          <div className="bulk-action-dropdown">
            <button
              className="btn btn-bulk btn-warning"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
            >
              🔄 Đổi vai trò
            </button>
            {showRoleMenu && (
              <div className="dropdown-menu">
                <button onClick={() => handleBulkRoleChange('Admin')}>
                  👑 Đổi thành Admin
                </button>
                <button onClick={() => handleBulkRoleChange('Staff')}>
                  👤 Đổi thành Staff
                </button>
              </div>
            )}
          </div>

          {/* Status Change */}
          <div className="bulk-action-dropdown">
            <button
              className="btn btn-bulk btn-info"
              onClick={() => setShowStatusMenu(!showStatusMenu)}
            >
              🔒 Thay đổi trạng thái
            </button>
            {showStatusMenu && (
              <div className="dropdown-menu">
                <button onClick={() => handleBulkStatusChange(true)}>
                  ✅ Kích hoạt tất cả
                </button>
                <button onClick={() => handleBulkStatusChange(false)}>
                  ⛔ Vô hiệu hóa tất cả
                </button>
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            className="btn btn-bulk btn-danger"
            onClick={() => {
              setShowConfirm(true);
            }}
          >
            🗑️ Xóa ({selectedUsers.length})
          </button>

          {/* Clear Selection */}
          <button
            className="btn btn-bulk btn-cancel"
            onClick={onClearSelection}
          >
            ✖ Hủy chọn
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="bulk-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="bulk-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header">
              <h3>⚠️ Xác nhận hành động</h3>
            </div>
            <div className="confirm-body">
              <p>
                Bạn có chắc chắn muốn xóa <strong>{selectedUsers.length}</strong> người dùng?
              </p>
              <div className="user-list-preview">
                {selectedUsers.slice(0, 5).map(user => (
                  <div key={user.id} className="user-preview-item">
                    <span>{user.fullName}</span>
                    <span className="user-role">({user.role})</span>
                  </div>
                ))}
                {selectedUsers.length > 5 && (
                  <div className="user-preview-more">
                    và {selectedUsers.length - 5} người khác...
                  </div>
                )}
              </div>
              <p className="warning-text">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className="confirm-footer">
              <button
                className="btn btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
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
    <div className="select-all-checkbox">
      <input
        type="checkbox"
        checked={isAllSelected}
        ref={(el) => {
          if (el) el.indeterminate = isIndeterminate;
        }}
        onChange={() => isAllSelected ? onClearAll() : onSelectAll()}
      />
      <label>
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
    <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(user)}
        disabled={disabled}
        title={disabled ? 'Không thể chọn tài khoản của bạn' : undefined}
      />
    </td>
  );
};
