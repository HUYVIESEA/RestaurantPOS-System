import { ROLES } from '../constants/roles';

/**
 * Authorization Utilities
 * Provides helper functions for role-based access control in the frontend
 * Roles: Admin, Manager, Staff (thu ngân/phục vụ), Chef (nhân viên bếp)
 */

export type UserRole = typeof ROLES.ADMIN | typeof ROLES.MANAGER | typeof ROLES.STAFF | typeof ROLES.CHEF;

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
  if (userRole === ROLES.ADMIN) return true; // Admin has all roles implicitly
  return allowedRoles.includes(userRole as UserRole);
};

/**
 * Check if user is Admin
 */
export const isAdmin = (userRole: string | undefined): boolean => {
  return userRole === ROLES.ADMIN;
};

/**
 * Check if user is Manager
 */
export const isManager = (userRole: string | undefined): boolean => {
  return userRole === ROLES.MANAGER;
};

/**
 * Check if user is Staff (thu ngân/phục vụ)
 */
export const isStaff = (userRole: string | undefined): boolean => {
  return userRole === ROLES.STAFF;
};

/**
 * Check if user is Chef (nhân viên bếp)
 */
export const isChef = (userRole: string | undefined): boolean => {
  return userRole === ROLES.CHEF;
};

/**
 * Check if user is Admin or Manager
 */
export const isAdminOrManager = (userRole: string | undefined): boolean => {
  return userRole === ROLES.ADMIN || userRole === ROLES.MANAGER;
};

/**
 * Get permissions for Products based on user role
 */
export const getProductPermissions = (userRole: string | undefined): Permission => {
  if (isAdminOrManager(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  // Chef can view products (to check ingredients, notes)
  if (isChef(userRole)) {
    return { canView: true, canCreate: false, canEdit: false, canDelete: false };
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
  return { canView: true, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Get permissions for Orders based on user role
 */
export const getOrderPermissions = (userRole: string | undefined): Permission => {
  if (isAdminOrManager(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  // Staff (thu ngân) can create and edit orders but not delete
  if (isStaff(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: false };
  }
  // Chef cannot manage orders directly (only via kitchen view)
  return { canView: false, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Get permissions for Tables based on user role
 */
export const getTablePermissions = (userRole: string | undefined): Permission => {
  if (isAdminOrManager(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  if (isStaff(userRole)) {
    return { canView: true, canCreate: false, canEdit: false, canDelete: false };
  }
  // Chef doesn't need table access
  return { canView: false, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Get permissions for Reports based on user role
 */
export const getReportPermissions = (userRole: string | undefined): Permission => {
  if (isAdminOrManager(userRole)) {
    return { canView: true, canCreate: false, canEdit: false, canDelete: false };
  }
  return { canView: false, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Get permissions for Users based on user role
 */
export const getUserPermissions = (userRole: string | undefined): Permission => {
  if (isAdmin(userRole)) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  return { canView: false, canCreate: false, canEdit: false, canDelete: false };
};

/**
 * Check if user can view all orders
 */
export const canViewAllOrders = (userRole: string | undefined): boolean => {
  return isAdminOrManager(userRole) || isStaff(userRole);
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
    case ROLES.ADMIN:
      return 'Quản trị viên';
    case ROLES.MANAGER:
      return 'Quản lý';
    case ROLES.STAFF:
      return 'Nhân viên';
    case ROLES.CHEF:
      return 'Đầu bếp';
    default:
      return 'Không xác định';
  }
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role: string | undefined): string => {
  switch (role) {
    case ROLES.ADMIN:
      return 'badge-danger'; // Red
    case ROLES.MANAGER:
      return 'badge-primary'; // Blue
    case ROLES.STAFF:
      return 'badge-success'; // Green
    case ROLES.CHEF:
      return 'badge-warning'; // Orange
    default:
      return 'badge-secondary'; // Gray
  }
};

/**
 * Get role description
 */
export const getRoleDescription = (role: string | undefined): string => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Toàn quyền quản lý hệ thống';
    case ROLES.MANAGER:
      return 'Quản lý vận hành nhà hàng';
    case ROLES.STAFF:
      return 'Nhân viên thu ngân/phục vụ';
    case ROLES.CHEF:
      return 'Nhân viên bếp';
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
