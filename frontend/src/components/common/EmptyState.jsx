import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  title = 'Tidak ada data',
  description = 'Data yang Anda cari tidak ditemukan atau masih kosong.',
  icon: Icon = PackageOpen,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`empty-state text-center ${className}`} style={{ padding: '3rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
      <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
