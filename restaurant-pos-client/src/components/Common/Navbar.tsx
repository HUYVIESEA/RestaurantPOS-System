import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // All possible menu items
  const allMenuItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-chart-line', permission: true }, // Always visible
  { path: '/tables', label: 'Bàn', icon: 'fa-utensils', permission: true }, // Always visible
    { path: '/orders', label: 'Đơn hàng', icon: 'fa-receipt', permission: true }, // Always visible
    { path: '/inventory', label: 'Kho hàng', icon: 'fa-warehouse', permission: permissions.products.canEdit },
    { path: '/kitchen', label: 'Bếp', icon: 'fa-fire', permission: true },
    { path: '/products', label: 'Thực đơn', icon: 'fa-box', permission: true }, // Always visible
    { path: '/categories', label: 'Danh mục', icon: 'fa-folder', permission: true }, // Always visible
    { path: '/suppliers', label: 'Nhà cung cấp', icon: 'fa-truck', permission: permissions.products.canEdit }, // Admin, Manager
    { path: '/statistics', label: 'Thống kê', icon: 'fa-chart-bar', permission: permissions.canAccessAnalytics || permissions.reports.canView }, // Admin, Manager

    { path: '/users', label: 'Người dùng', icon: 'fa-users', permission: permissions.users.canView }, // Admin only
  ];

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter(item => item.permission);
  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <img src="/restaurant.png" alt="Logo" className="brand-logo" style={{height: '32px', width: 'auto', marginRight: '0.75rem'}} />
            <span className="brand-text">Smart Order</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
>
          <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        {/* Navigation Menu */}
        <ul className={`navbar-menu ${showMobileMenu ? 'mobile-open' : ''}`}>
    {menuItems.map(item => (
            <li key={item.path} className="nav-item">
  <Link
             to={item.path}
           className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
    onClick={() => setShowMobileMenu(false)}
           >
     <i className={`fas ${item.icon} nav-icon`}></i>
            <span className="nav-label">{item.label}</span>
  </Link>
    </li>
          ))}
        </ul>

        {/* Right Side Actions */}
  <div className="navbar-actions">
   {/* Notification Bell */}
   <NotificationBell />
 
          {/* Theme Toggle */}
          <ThemeToggle />
          
  {/* User Menu */}
  <div className="navbar-user">
       <button
 className="user-menu-button"
         onClick={() => setShowUserMenu(!showUserMenu)}
       >
     <div className="user-avatar">
       <i className="fas fa-user-circle"></i>
     </div>
            <div className="user-info">
    <span className="user-name">{user?.fullName}</span>
       <span className="user-role">
          <i className={`fas ${
            user?.role === 'Admin' ? 'fa-crown' : 
            user?.role === 'Manager' ? 'fa-user-tie' : 
            'fa-user'
          }`}></i>
 {user?.role}
   </span>
     </div>
      <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'} dropdown-arrow`}></i>
        </button>

       {/* Dropdown Menu */}
  {showUserMenu && (
        <div className="user-dropdown">
     <Link
      to="/profile"
         className="dropdown-item"
onClick={() => setShowUserMenu(false)}
     >
         <i className="fas fa-user dropdown-icon"></i>
      <span>Hồ sơ cá nhân</span>
  </Link>
    <Link
     to="/change-password"
          className="dropdown-item"
         onClick={() => setShowUserMenu(false)}
           >
 <i className="fas fa-key dropdown-icon"></i>
       <span>Đổi mật khẩu</span>
     </Link>
              <div className="dropdown-divider"></div>
        <button
      className="dropdown-item logout-item"
 onClick={() => {
        setShowUserMenu(false);
           logout();
      }}
     >
     <i className="fas fa-right-from-bracket dropdown-icon"></i>
           <span>Đăng xuất</span>
  </button>
    </div>
    )}
  </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
