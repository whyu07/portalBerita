import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'default', // sm, default, lg
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  icon,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = variant === 'outline' ? 'btn-outline' 
                   : variant === 'ghost' ? 'btn-ghost' 
                   : variant === 'danger' ? 'btn-outline text-danger border-danger' 
                   : `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const loadingClass = loading ? 'opacity-70 cursor-not-allowed' : '';

  // To support legacy inline danger style
  const dangerStyle = variant === 'danger' ? { color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' } : {};

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${className}`}
      style={{ ...dangerStyle, ...props.style }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" style={{ marginRight: '0.5rem' }} />
          {children}
        </>
      ) : (
        <>
          {icon && <span style={{ marginRight: '0.5rem', display: 'flex' }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
