import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export const RelatedCard = ({ article }) => {
  if (!article) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/300x200/1e293b/ffffff?text=404+Image+Not+Found';
  };

  return (
    <div className="news-list-item" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {article.thumbnail_url && (
        <Link to={`/article/${article.slug}`} style={{ flexShrink: 0 }}>
          <img 
            src={article.thumbnail_url} 
            alt={article.title} 
            style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
            onError={handleImageError} 
          />
        </Link>
      )}
      <div style={{ flex: 1 }}>
        {article.category && (
          <Link to={`/category/${article.category.slug}`} style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {article.category.name}
          </Link>
        )}
        <h4 style={{ fontSize: '1.1rem', margin: '0.25rem 0', lineHeight: 1.4 }}>
          <Link to={`/article/${article.slug}`}>{article.title}</Link>
        </h4>
        <div className="meta-text" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
          <Clock size={12} /> {formatDate(article.created_at)}
        </div>
      </div>
    </div>
  );
};
