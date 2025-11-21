/**
 * Authorization Utilities
 * Provides helper functions for role-based access control in the frontend
 */

export type UserRole = 'Admin' | 'Manager' | 'Staff';

export interface Permission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Check if user has a specific role
 */
export const hasRole = (userRole: string | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
};

/**
 * Check if user is Admin
 */
export const isAdmin = (userRole: string | undefined): boolean => {
  return userRole === 'Admin';
};

/**
 * Check if user is Manager
 */
export const isManager = (userRole: string | undefined): boolean => {
  return userRole === 'Manager';
};

/**
 * Check if user is Staff
 */
export const isStaff = (userRole: string | undefined): boolean => {
  return userRole === 'Staff';
};

/**
 * Check if user is Admin or Manager
 */
export const isAdminOrManager = (userRole: string | undefined): boolean => {
  return userRole === 'Admin' || userRole === 'Manager';
};

/**
 * Get permissions for Products based on user role
 */
export const getProductPermissions = (userRole: string | undefined): Permission => {
  if (isAdminOrManager(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  // Staff can only view
  return { canView: true, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Get permissions for Categories based on user role
 */
export const getCategoryPermissions = (userRole: string | undefined): Permission => {
  if (isAdminOrManager(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  // Staff can only view
  return { canView: true, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Get permissions for Orders based on user role
 */
export const getOrderPermissions = (userRole: string | undefined): Permission => {
  if (isAdminOrManager(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  // Staff can create and edit but not delete
  return { canView: true, canCreate: true, canEdit: true, canDelete: false };
};

/**
 * Get permissions for Tables based on user role
 */
export const getTablePermissions = (userRole: string | undefined): Permission => {
  if (isAdminOrManager(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  // Staff can only view
  return { canView: true, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Get permissions for Reports based on user role
 */
export const getReportPermissions = (userRole: string | undefined): Permission => {
  if (isAdminOrManager(userRole)) {
    return { canView: true, canCreate: false, canEdit: false, canDelete: false };
  }
  // Staff cannot access reports
  return { canView: false, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Get permissions for Users based on user role
 */
export const getUserPermissions = (userRole: string | undefined): Permission => {
  if (isAdmin(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  // Manager and Staff cannot manage users
  return { canView: false, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Check if user can view all orders (Admin and Manager only)
 */
export const canViewAllOrders = (userRole: string | undefined): boolean => {
  return isAdminOrManager(userRole);
};

/**
 * Check if user can access analytics/dashboard
 */
export const canAccessAnalytics = (userRole: string | undefined): boolean => {
  return isAdminOrManager(userRole);
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: string | undefined): string => {
  switch (role) {
    case 'Admin':
      return 'Quản trị viên';
    case 'Manager':
      return 'Quản lý';
    case 'Staff':
      return 'Nhân viên';
    default:
      return 'Không xác định';
  }
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role: string | undefined): string => {
  switch (role) {
    case 'Admin':
      return 'badge-danger'; // Red
    case 'Manager':
      return 'badge-primary'; // Blue
    case 'Staff':
      return 'badge-success'; // Green
    default:
      return 'badge-secondary'; // Gray
  }
};

/**
 * Get role description
 */
export const getRoleDescription = (role: string | undefined): string => {
  switch (role) {
    case 'Admin':
      return 'Toàn quyền quản lý hệ thống';
    case 'Manager':
      return 'Quản lý vận hành nhà hàng';
    case 'Staff':
      return 'Nhân viên phục vụ';
    default:
      return '';
  }
};

/**
 * Check if user can perform action on resource
 */
export const canPerformAction = (
  userRole: string | undefined,
  resource: 'products' | 'categories' | 'orders' | 'tables' | 'reports' | 'users',
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean => {
  let permissions: Permission;

  switch (resource) {
    case 'products':
      permissions = getProductPermissions(userRole);
      break;
    case 'categories':
      permissions = getCategoryPermissions(userRole);
      break;
    case 'orders':
      permissions = getOrderPermissions(userRole);
      break;
    case 'tables':
      permissions = getTablePermissions(userRole);
      break;
    case 'reports':
      permissions = getReportPermissions(userRole);
      break;
    case 'users':
      permissions = getUserPermissions(userRole);
      break;
    default:
      return false;
  }

  switch (action) {
    case 'view':
      return permissions.canView;
    case 'create':
      return permissions.canCreate;
    case 'edit':
      return permissions.canEdit;
    case 'delete':
      return permissions.canDelete;
    default:
      return false;
  }
};
