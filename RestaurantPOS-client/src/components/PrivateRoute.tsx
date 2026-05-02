import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';

interface PrivateRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading: _loading } = useAuth();
  const location = useLocation();

  // if (loading) {
  //   return <Loading message="Đang kiểm tra đăng nhập..." fullScreen={true} />;
  // }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin has access to everything
  if (user?.role === ROLES.ADMIN) {
    return children;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Smart redirect based on role
    if (user.role === ROLES.CHEF) return <Navigate to="/kitchen" replace />;
    if (user.role === ROLES.CASHIER) return <Navigate to="/orders" replace />;
    return <Navigate to="/" replace />;
  }

  // Handle default redirect if user accesses "/"
  if (location.pathname === '/') {
    if (user?.role === ROLES.CHEF) return <Navigate to="/kitchen" replace />;
    if (user?.role === ROLES.CASHIER) return <Navigate to="/orders" replace />;
  }

  return children;
};

export default PrivateRoute;
