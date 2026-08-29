import React from 'react';

export const Skeleton = ({ width, height, className = '', style = {}, variant = 'rect' }) => {
  const baseStyle = {
    background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-color) 50%, var(--bg-secondary) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: variant === 'circle' ? '50%' : variant === 'text' ? '4px' : 'var(--radius-md)',
    width: width || '100%',
    height: height || (variant === 'text' ? '1.2em' : '100%'),
    ...style,
  };

  return (
    <div className={`skeleton ${className}`} style={baseStyle} aria-busy="true" aria-hidden="true">
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
};

export const CardSkeleton = () => (
  <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
    <Skeleton height="160px" style={{ marginBottom: '1rem' }} />
    <Skeleton height="24px" width="40%" style={{ marginBottom: '0.5rem' }} />
    <Skeleton height="28px" style={{ marginBottom: '0.5rem' }} />
    <Skeleton height="28px" width="80%" style={{ marginBottom: '1rem' }} />
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Skeleton height="16px" width="60px" />
      <Skeleton height="16px" width="60px" />
    </div>
  </div>
);
