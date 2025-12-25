import React from 'react';
import './Loading.css';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Đang tải...', 
  fullScreen = false,
  size = 'medium'
}) => {
  return (
    <div className={`loading-container ${fullScreen ? 'fullscreen' : ''} ${size}`}>
      <div className="loading-content">
        {/* Animated Logo/Icon */}
        <div className="loading-icon">
          <i className="fas fa-store"></i>
        </div>
        
        {/* Spinner */}
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        {/* Message */}
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
