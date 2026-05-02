import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  isAdmin,
  isManager,
  isStaff,
  isAdminOrManager,
  getProductPermissions,
  getCategoryPermissions,
  getOrderPermissions,
  getTablePermissions,
  getReportPermissions,
  getUserPermissions,
  canViewAllOrders,
  canAccessAnalytics,
  canPerformAction
} from '../utils/authUtils';

/**
 * Custom hook for authorization
 * Provides easy access to user permissions and role checks
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  const permissions = useMemo(() => ({
    // Role checks
    isAdmin: isAdmin(userRole),
    isManager: isManager(userRole),
    isStaff: isStaff(userRole),
    isAdminOrManager: isAdminOrManager(userRole),

    // Resource permissions
    products: getProductPermissions(userRole),
    categories: getCategoryPermissions(userRole),
    orders: getOrderPermissions(userRole),
    tables: getTablePermissions(userRole),
    reports: getReportPermissions(userRole),
    users: getUserPermissions(userRole),

    // Special permissions
    canViewAllOrders: canViewAllOrders(userRole),
    canAccessAnalytics: canAccessAnalytics(userRole),

    // Helper function
    can: (
      resource: 'products' | 'categories' | 'orders' | 'tables' | 'reports' | 'users',
      action: 'view' | 'create' | 'edit' | 'delete'
    ) => canPerformAction(userRole, resource, action),
  }), [userRole]);

  return permissions;
};

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (allowedRoles: string[]) => {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role);
};

/**
 * Hook to get current user role
 */
export const useUserRole = () => {
  const { user } = useAuth();
  return user?.role;
};
