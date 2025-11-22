import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      title={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
    >
      <div className={`toggle-track ${theme}`}>
        <div className="toggle-thumb">
          <i className={`fas ${theme === 'light' ? 'fa-sun' : 'fa-moon'}`}></i>
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
