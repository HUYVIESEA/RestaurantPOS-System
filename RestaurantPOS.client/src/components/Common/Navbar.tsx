import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useHasRole } from '../../hooks/usePermissions';
import { ROLES } from '../../constants/roles';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin = useHasRole([ROLES.ADMIN]);
  const isManager = useHasRole([ROLES.MANAGER]);
  const isStaff = useHasRole([ROLES.STAFF]);
  const isChef = useHasRole([ROLES.CHEF]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Close mobile menu when screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chef gets a dedicated minimal sidebar
  if (isChef && !isAdmin) {
    return (
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 text-white shadow-xl flex flex-col transition-transform duration-300 transform md:translate-x-0 -translate-x-full">
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <Link to="/kitchen" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-all duration-300">
              <i className="fas fa-fire-burner text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold tracking-wider text-blue-600">MÀN BẾP</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            <li>
              <Link to="/kitchen" className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/kitchen') ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                <i className="fas fa-fire-burner text-lg w-8 text-center"></i>
                <span>Bếp</span>
              </Link>
            </li>
            <li>
              <Link to="/products" className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/products') ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                <i className="fas fa-hamburger text-lg w-8 text-center"></i>
                <span>Thực đơn</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
             <ThemeToggle />
          </div>
          <button className="flex items-center gap-3 p-3 w-full rounded-xl hover:bg-gray-800 transition-colors" onClick={() => setShowUserMenu(!showUserMenu)}>
             <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center border-2 border-gray-800 shadow-sm"><i className="fas fa-user text-gray-300"></i></div>
             <div className="flex flex-col items-start text-left flex-1">
                <span className="text-sm font-semibold text-gray-200 leading-tight truncate">{user?.fullName}</span>
                <span className="text-xs text-orange-400 flex items-center gap-1"><i className="fas fa-hat-chef mr-1"></i>Đầu bếp</span>
             </div>
             <i className={`fas fa-chevron-up text-xs text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
          </button>
          {showUserMenu && (
             <div className="mt-2 w-full bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-2 overflow-hidden">
                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 w-full text-left transition-colors" onClick={() => setShowUserMenu(false)}>
                   <i className="fas fa-circle-user w-5 text-center"></i> Hồ sơ cá nhân
                </Link>
                <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 w-full text-left transition-colors" onClick={() => setShowUserMenu(false)}>
                   <i className="fas fa-key w-5 text-center"></i> Đổi mật khẩu
                </Link>
                <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full text-left transition-colors" onClick={() => { setShowUserMenu(false); logout(); }}>
                   <i className="fas fa-arrow-right-from-bracket w-5 text-center"></i> Đăng xuất
                </button>
             </div>
          )}
        </div>
      </aside>
    );
  }

  const allMenuItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-chart-pie', permission: isAdmin },
    { path: '/tables', label: 'Bàn & Khu vực', icon: 'fa-concierge-bell', permission: isAdmin || isManager || isStaff },
    { path: '/orders', label: 'Đơn hàng', icon: 'fa-file-invoice-dollar', permission: isAdmin || isManager || isStaff },
    { path: '/products', label: 'Thực đơn', icon: 'fa-hamburger', permission: isAdmin || isManager },
    { path: '/categories', label: 'Danh mục', icon: 'fa-layer-group', permission: isAdmin || isManager },
    { path: '/inventory', label: 'Kho hàng', icon: 'fa-boxes', permission: isAdmin || isManager },
    { path: '/suppliers', label: 'Nhà cung cấp', icon: 'fa-truck-loading', permission: isAdmin || isManager },
    { path: '/kitchen', label: 'Bếp', icon: 'fa-fire-burner', permission: isAdmin },
    { path: '/statistics', label: 'Thống kê', icon: 'fa-chart-area', permission: isAdmin },
    { path: '/users', label: 'Người dùng', icon: 'fa-user-friends', permission: isAdmin },
  ];

  const menuItems = allMenuItems.filter(item => item.permission);

  return (
    <>
      {/* Mobile Header (Top bar only on mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4 shadow-sm">
        <Link to={isAdmin ? "/" : "/orders"} className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 shadow-md">
            <i className="fas fa-concierge-bell text-white text-sm"></i>
          </div>
          <span className="text-lg font-bold text-blue-700 dark:text-blue-500">
            Smart POS
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <NotificationBell placement="bottom-right" />
          <button 
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileOpen(true)}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 shadow-xl md:shadow-none flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* App Logo */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <Link to={isAdmin ? "/" : "/orders"} className="flex items-center gap-3 group" onClick={() => setIsMobileOpen(false)}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-all duration-300">
              <i className="fas fa-concierge-bell text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-500">
              Smart Order
            </span>
          </Link>
          <button 
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            onClick={() => setIsMobileOpen(false)}
          >
            <i className="fas fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive(item.path) 
                      ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-500' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-500'
                  }`}
                >
                  <div className={`w-8 flex justify-center ${isActive(item.path) ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'}`}>
                    <i className={`fas ${item.icon} text-lg`}></i>
                  </div>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-4 px-2 hidden md:flex">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tiện ích</span>
              <div className="flex items-center gap-3">
                <NotificationBell placement="top-left" />
                <ThemeToggle />
              </div>
           </div>
          
          {/* User Profile Menu */}
          <div className="relative">
            <button
              className="flex items-center gap-3 p-2 w-full rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm shrink-0">
                <i className="fas fa-user text-blue-600 dark:text-gray-300"></i>
              </div>
              <div className="flex flex-col items-start flex-1 overflow-hidden">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight w-full truncate text-left">{user?.fullName || 'User'}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <i className={`fas ${
                    user?.role === ROLES.ADMIN ? 'fa-crown text-yellow-500' : 
                    user?.role === ROLES.MANAGER ? 'fa-user-tie text-blue-600' : 
                    user?.role === ROLES.CHEF ? 'fa-hat-chef text-orange-400' :
                    'fa-user text-gray-400'
                  } text-[10px]`}></i>
                  {user?.role || 'Guest'}
                </span>
              </div>
              <i className={`fas fa-chevron-up text-xs text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-none border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden transform origin-bottom animate-fade-in-up">
                <div className="md:hidden px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Giao diện</span>
                  <ThemeToggle />
                </div>
                
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="fas fa-circle-user w-5 text-center text-gray-400"></i>
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link
                  to="/change-password"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="fas fa-key w-5 text-center text-gray-400"></i>
                  <span>Đổi mật khẩu</span>
                </Link>
                {(isAdmin || isManager) && (
                  <Link
                    to="/payment-settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <i className="fas fa-credit-card w-5 text-center text-gray-400"></i>
                    <span>Cấu hình thanh toán</span>
                  </Link>
                )}
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                <button
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left transition-colors font-medium"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                >
                  <i className="fas fa-arrow-right-from-bracket w-5 text-center"></i>
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
