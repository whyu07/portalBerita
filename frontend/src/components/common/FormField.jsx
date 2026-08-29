import React from 'react';

export const FormField = ({
  label,
  id,
  type = 'text',
  error,
  helperText,
  className = '',
  required = false,
  as = 'input', // input, textarea, select
  children,
  ...props
}) => {
  const isInvalid = !!error;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      
      {as === 'textarea' ? (
        <textarea
          id={id}
          className={`form-control ${isInvalid ? 'border-danger' : ''}`}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          required={required}
          {...props}
        />
      ) : as === 'select' ? (
        <select
          id={id}
          className={`form-control ${isInvalid ? 'border-danger' : ''}`}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          required={required}
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          className={`form-control ${isInvalid ? 'border-danger' : ''}`}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          required={required}
          {...props}
        />
      )}

      {error && (
        <p id={`${id}-error`} className="text-danger mt-1 text-sm">
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p id={`${id}-helper`} className="text-muted mt-1 text-sm">
          {helperText}
        </p>
      )}
    </div>
  );
};
