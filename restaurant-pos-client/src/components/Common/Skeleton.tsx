/**
 * Skeleton Loading Components
 * Provides beautiful loading states for various UI elements
 */

import React from 'react';
import './Skeleton.css';

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
  borderRadius = 'var(--radius-md)',
  className = '',
  variant = 'rectangular',
  animation = 'pulse'
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: variant === 'circular' ? '50%' : borderRadius
  };

  const classes = [
    'skeleton',
    `skeleton-${variant}`,
    `skeleton-${animation}`,
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} style={style} />;
};

// Card Skeleton
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton height="200px" className="skeleton-card-image" />
      <div className="skeleton-card-content">
      <Skeleton height="24px" width="70%" className="mb-2" />
        <Skeleton height="16px" width="100%" className="mb-1" />
    <Skeleton height="16px" width="90%" className="mb-3" />
        <div className="d-flex justify-between align-center">
          <Skeleton height="20px" width="80px" />
        <Skeleton height="36px" width="100px" />
        </div>
      </div>
    </div>
  );
};

// Table Row Skeleton
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="skeleton-table-row">
    {Array.from({ length: columns }).map((_, index) => (
        <td key={index}>
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
    <div className="skeleton-table-container">
      <table className="skeleton-table">
      {hasHeader && (
        <thead>
        <tr>
           {Array.from({ length: columns }).map((_, index) => (
       <th key={index}>
   <Skeleton height="16px" width="80%" />
         </th>
              ))}
  </tr>
          </thead>
        )}
        <tbody>
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
  <div className="skeleton-list-item">
      {hasAvatar && <Skeleton variant="circular" width="48px" height="48px" />}
<div className="skeleton-list-content">
        <Skeleton height="20px" width="60%" className="mb-1" />
        <Skeleton height="16px" width="40%" />
      </div>
      {hasActions && (
        <div className="skeleton-list-actions">
        <Skeleton width="80px" height="32px" />
 </div>
      )}
    </div>
  );
};

// Form Skeleton
export const SkeletonForm: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <div className="skeleton-form">
   {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="skeleton-form-group">
      <Skeleton height="14px" width="120px" className="mb-2" />
          <Skeleton height="44px" width="100%" />
     </div>
      ))}
      <div className="skeleton-form-actions">
        <Skeleton height="44px" width="120px" />
        <Skeleton height="44px" width="120px" />
      </div>
    </div>
  );
};

// Profile Header Skeleton
export const SkeletonProfile: React.FC = () => {
  return (
    <div className="skeleton-profile">
   <div className="skeleton-profile-header">
        <Skeleton variant="circular" width="100px" height="100px" />
     <div className="skeleton-profile-info">
          <Skeleton height="32px" width="200px" className="mb-2" />
          <Skeleton height="20px" width="150px" className="mb-2" />
          <Skeleton height="24px" width="100px" />
        </div>
      </div>
      <div className="skeleton-profile-content">
  <SkeletonForm fields={6} />
      </div>
    </div>
  );
};

// Grid Skeleton
interface SkeletonGridProps {
  items?: number;
  columns?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ items = 6, columns = 3 }) => {
  return (
  <div className="skeleton-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

// Stats Card Skeleton
export const SkeletonStats: React.FC = () => {
  return (
    <div className="skeleton-stats">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="skeleton-stat-card">
       <Skeleton height="20px" width="120px" className="mb-2" />
          <Skeleton height="36px" width="100px" className="mb-1" />
        <Skeleton height="16px" width="80px" />
        </div>
      ))}
    </div>
  );
};

// Text Block Skeleton
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
     height="16px"
          width={index === lines - 1 ? '60%' : '100%'}
     className="mb-2"
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
    <div className={`loading-overlay ${transparent ? 'transparent' : ''}`}>
      <div className="loading-spinner">
      <div className="spinner-border"></div>
        {message && <p className="loading-message">{message}</p>}
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
