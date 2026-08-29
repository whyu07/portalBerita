import React from 'react';

export const StatusBadge = ({ status, type = 'status', labelOverride, priority }) => {
  // type can be 'status' (published/draft), 'featured', 'breaking'
  
  if (type === 'featured') {
    return (
      <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--accent-warning)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
        {labelOverride || 'UTAMA'}
      </span>
    );
  }
  
  if (type === 'breaking') {
    return (
      <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--accent-danger)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
        {labelOverride || `BREAKING ${priority ? `(${priority})` : ''}`}
      </span>
    );
  }
  
  // Default type: status
  const isPublished = status === 'published';
  const label = isPublished ? 'Tayang' : 'Draft';
  const bg = isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
  const color = isPublished ? '#10b981' : '#f59e0b';
  
  return (
    <span className="badge-category" style={{ background: bg, color: color, borderColor: 'transparent' }}>
      {label}
    </span>
  );
};
