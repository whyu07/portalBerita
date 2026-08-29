import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({
  variant = 'info', // info, success, warning, error
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = {
    info: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '#3b82f6', icon: <Info size={20} /> },
    success: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '#10b981', icon: <CheckCircle size={20} /> },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: '#f59e0b', icon: <AlertTriangle size={20} /> },
    error: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: '#ef4444', icon: <AlertCircle size={20} /> },
  };

  const style = styles[variant] || styles.info;

  return (
    <div 
      className={`alert d-flex align-start ${className}`} 
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div style={{ color: style.text, marginTop: '2px' }}>
        {style.icon}
      </div>
      
      <div style={{ flex: 1 }}>
        {title && <h4 style={{ color: style.text, margin: '0 0 0.25rem 0', fontWeight: 700 }}>{title}</h4>}
        <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{message}</p>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          aria-label="Tutup alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
