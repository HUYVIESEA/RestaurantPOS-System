/**
 * Skeleton Loading Components
 * Provides beautiful loading states for various UI elements
 */

import React from 'react';

// Base Skeleton Component
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '0.375rem', // Tailwind md
  className = '',
  variant = 'rectangular',
  animation = 'pulse'
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: variant === 'circular' ? '50%' : borderRadius
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse': return 'animate-pulse';
      // Tailwind doesn't have a built-in wave animation by default, fallback to pulse
      // or we can add a custom animation in tailwind config later
      case 'wave': return 'animate-pulse'; 
      case 'none': return '';
      default: return 'animate-pulse';
    }
  };

  const classes = [
    'bg-gray-200 dark:bg-slate-700',
    variant === 'circular' ? 'rounded-full' : '',
    getAnimationClass(),
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} style={style} />;
};

// Card Skeleton
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm ${className}`}>
      <Skeleton height="200px" className="w-full rounded-none" />
      <div className="p-4">
        <Skeleton height="24px" width="70%" className="mb-2" />
        <Skeleton height="16px" width="100%" className="mb-1" />
        <Skeleton height="16px" width="90%" className="mb-3" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton height="20px" width="80px" />
          <Skeleton height="36px" width="100px" borderRadius="9999px" />
        </div>
      </div>
    </div>
  );
};

// Table Row Skeleton
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="border-b border-gray-100 dark:border-slate-700 last:border-0">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4 whitespace-nowrap">
          <Skeleton height="20px" />
        </td>
      ))}
    </tr>
  );
};

// Table Skeleton
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 5,
  hasHeader = true
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        {hasHeader && (
          <thead className="bg-gray-50 dark:bg-slate-800/50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3 text-left">
                  <Skeleton height="16px" width="80%" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {Array.from({ length: rows }).map((_, index) => (
            <SkeletonTableRow key={index} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// List Item Skeleton
export const SkeletonListItem: React.FC<{ hasAvatar?: boolean; hasActions?: boolean }> = ({
  hasAvatar = true,
  hasActions = false
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mb-3">
      {hasAvatar && <Skeleton variant="circular" width="48px" height="48px" className="shrink-0" />}
      <div className="flex-1 min-w-0">
        <Skeleton height="20px" width="60%" className="mb-2" />
        <Skeleton height="16px" width="40%" />
      </div>
      {hasActions && (
        <div className="shrink-0 ml-4">
          <Skeleton width="80px" height="32px" borderRadius="0.375rem" />
        </div>
      )}
    </div>
  );
};

// Form Skeleton
export const SkeletonForm: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
      <div className="space-y-5">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index}>
            <Skeleton height="14px" width="120px" className="mb-2" />
            <Skeleton height="44px" width="100%" borderRadius="0.5rem" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100 dark:border-slate-700">
        <Skeleton height="44px" width="100px" borderRadius="0.5rem" />
        <Skeleton height="44px" width="120px" borderRadius="0.5rem" />
      </div>
    </div>
  );
};

// Profile Header Skeleton
export const SkeletonProfile: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="h-32 bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
      <div className="px-6 pb-6 relative">
        <div className="-mt-12 mb-4 flex items-end">
          <div className="p-1 bg-white dark:bg-slate-800 rounded-full inline-block">
            <Skeleton variant="circular" width="96px" height="96px" />
          </div>
        </div>
        <div className="space-y-3 max-w-md">
          <Skeleton height="32px" width="60%" />
          <Skeleton height="20px" width="40%" />
          <div className="flex gap-2 pt-2">
            <Skeleton height="24px" width="80px" borderRadius="9999px" />
            <Skeleton height="24px" width="100px" borderRadius="9999px" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Grid Skeleton
interface SkeletonGridProps {
  items?: number;
  columns?: number;
  className?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ 
  items = 6, 
  className = ''
}) => {
  return (
    <div 
      className={`grid gap-6 ${className}`} 
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr))` }}
    >
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

// Stats Card Skeleton
export const SkeletonStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <Skeleton variant="circular" width="48px" height="48px" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton height="14px" width="60%" className="mb-2" />
            <Skeleton height="28px" width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Text Block Skeleton
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="16px"
          width={index === lines - 1 ? '70%' : '100%'}
          borderRadius="0.25rem"
        />
      ))}
    </div>
  );
};

// Loading Overlay
interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Đang tải...',
  transparent = false
}) => {
  return (
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl transition-colors ${
      transparent 
        ? 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px]' 
        : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'
    }`}>
      <div className="p-4 bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center animate-scale-in">
        <div className="w-10 h-10 border-3 border-blue-100 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
        {message && <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">{message}</p>}
      </div>
    </div>
  );
};

// Export all components
export default {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonTableRow,
  SkeletonListItem,
  SkeletonForm,
  SkeletonProfile,
  SkeletonGrid,
  SkeletonStats,
  SkeletonText,
  LoadingOverlay
};
