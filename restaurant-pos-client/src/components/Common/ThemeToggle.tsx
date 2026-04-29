import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button 
      className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600"
      onClick={toggleTheme}
      title={`Chuyển sang chế độ ${isDark ? 'sáng' : 'tối'}`}
      aria-pressed={isDark}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Sun/Moon Icons in background */}
      <span className="absolute inset-0 flex h-full w-full items-center justify-between px-2 text-xs">
        <i className="fas fa-moon text-slate-400"></i>
        <i className="fas fa-sun text-yellow-500"></i>
      </span>

      {/* Sliding thumb */}
      <span
        className={`absolute inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out ${
          isDark ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        <i className={`fas text-[10px] ${
          isDark ? 'fa-moon text-blue-700' : 'fa-sun text-yellow-500'
        }`}></i>
      </span>
    </button>
  );
};

export default ThemeToggle;
