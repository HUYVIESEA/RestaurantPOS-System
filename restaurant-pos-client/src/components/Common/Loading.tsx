import React from 'react';

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
  const containerClasses = [
    'flex items-center justify-center',
    fullScreen 
      ? 'fixed inset-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm z-[10000] min-h-screen' 
      : 'p-8 md:p-12 min-h-[200px] md:min-h-[300px]'
  ].join(' ');

  const iconSizes = {
    small: 'text-3xl w-[50px] h-[50px]',
    medium: 'text-4xl md:text-5xl w-[60px] h-[60px] md:w-[80px] md:h-[80px]',
    large: 'text-6xl w-[100px] h-[100px]'
  };

  const spinnerSizes = {
    small: 'w-[50px] h-[50px] border-2',
    medium: 'w-[60px] h-[60px] md:w-[80px] md:h-[80px] border-[3px]',
    large: 'w-[100px] h-[100px] border-4'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base md:text-lg',
    large: 'text-xl'
  };

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        
        {/* Animated Logo/Icon with Ripple effect */}
        <div className={`relative flex items-center justify-center text-blue-800 dark:text-blue-500 animate-pulse ${iconSizes[size]}`}>
           <div className="absolute inset-0 bg-gradient-to-br from-blue-800/10 to-blue-600/10 rounded-full animate-ping"></div>
           <i className="fas fa-store relative z-10"></i>
        </div>
        
        {/* Triple Ring Spinner */}
        <div className={`relative ${spinnerSizes[size].split(' ')[0]} ${spinnerSizes[size].split(' ')[1]}`}>
          <div className={`absolute inset-0 rounded-full border-transparent border-t-blue-700 dark:border-t-blue-400 animate-spin ${spinnerSizes[size].split(' ')[2]}`} style={{ animationDuration: '1.5s', animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' }}></div>
          <div className={`absolute inset-[15%] rounded-full border-transparent border-t-blue-600 dark:border-t-blue-400/80 animate-spin ${spinnerSizes[size].split(' ')[2]}`} style={{ animationDuration: '1.5s', animationDelay: '-0.5s', animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' }}></div>
          <div className={`absolute inset-[30%] rounded-full border-transparent border-t-blue-400 dark:border-t-blue-300/80 animate-spin ${spinnerSizes[size].split(' ')[2]}`} style={{ animationDuration: '1.5s', animationDelay: '-1s', animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' }}></div>
        </div>
        
        {/* Message */}
        {message && (
          <p className={`m-0 font-semibold text-center text-blue-800 dark:text-blue-500 animate-pulse ${textSizes[size]}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
