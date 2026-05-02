import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasRole, UserRole } from '../../utils/authUtils';

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Protected Component
 * Renders children only if user has one of the allowed roles
 * Otherwise renders fallback or nothing
 */
export const Protected: React.FC<ProtectedProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { user } = useAuth();
  
  if (!user || !hasRole(user.role, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface ProtectedActionProps {
  children: React.ReactNode;
  resource: 'products' | 'categories' | 'orders' | 'tables' | 'reports' | 'users';
  action: 'view' | 'create' | 'edit' | 'delete';
  fallback?: React.ReactNode;
}

/**
 * ProtectedAction Component
 * Renders children only if user can perform the specified action on the resource
 */
export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  children,
  resource,
  action,
  fallback = null
}) => {
  const { user } = useAuth();
  
  // Import canPerformAction dynamically to avoid circular dependency
  const canPerformAction = (
    userRole: string | undefined,
    res: string,
    act: string
  ): boolean => {
    // Simple role-based logic
    if (!userRole) return false;
    
    const isAdmin = userRole === 'Admin';
    const isManager = userRole === 'Manager';
    
    // Admin can do everything
    if (isAdmin) return true;
    
    // Manager permissions
    if (isManager) {
      if (res === 'users') return false; // Cannot manage users
      if (res === 'reports') return act === 'view'; // Can only view reports
      return true; // Can do everything else
    }
    
    // Staff permissions
    if (res === 'reports' || res === 'users') return false;
    if (res === 'orders') return act !== 'delete';
    if (res === 'products' || res === 'categories' || res === 'tables') {
      return act === 'view';
    }
    
    return false;
  };
  
  if (!canPerformAction(user?.role, resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminOnly Component
 * Renders children only if user is Admin
 */
export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  return <Protected allowedRoles={['Admin']} fallback={fallback}>{children}</Protected>;
};

interface AdminOrManagerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminOrManager Component
 * Renders children only if user is Admin or Manager
 */
export const AdminOrManager: React.FC<AdminOrManagerProps> = ({ children, fallback = null }) => {
  return <Protected allowedRoles={['Admin', 'Manager']} fallback={fallback}>{children}</Protected>;
};
