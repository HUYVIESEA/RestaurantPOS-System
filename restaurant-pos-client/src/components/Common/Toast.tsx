import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for animation to finish
  };

  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
  };

  const iconMap = {
    success: 'fas fa-circle-check',
    error: 'fas fa-xmark-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-triangle-exclamation',
  };

  const iconColor = {
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400',
    info: 'text-blue-500 dark:text-blue-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] flex items-center justify-between min-w-[300px] max-w-md p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out ${isClosing ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'} ${typeStyles[type]}`}>
      <div className="flex items-start gap-3">
        <i className={`${iconMap[type]} ${iconColor[type]} mt-0.5 text-lg`}></i>
        <span className="text-sm font-medium leading-snug">{message}</span>
      </div>
      <button 
        className={`ml-4 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent ${iconColor[type].replace('text-', 'focus:ring-')}`}
        onClick={handleClose}
        aria-label="Close"
      >
        <i className="fas fa-xmark"></i>
      </button>
    </div>
  );
};

export default Toast;
