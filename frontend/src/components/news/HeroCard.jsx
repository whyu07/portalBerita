import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';

export const HeroCard = ({ article }) => {
  if (!article) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/1200x600/1e293b/ffffff?text=404+Image+Not+Found';
  };

  return (
    <div className="hero-main">
      <Link to={`/article/${article.slug}`}>
        <img
          src={article.thumbnail_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80'}
          alt={article.title}
          className="hero-main-img"
          onError={handleImageError}
        />
        <div className="hero-overlay">
          {article.category && (
            <span className="badge-category" style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none' }}>
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
              UTAMA • {article.category.name}
            </span>
          )}
          <h1 className="hero-title">{article.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '750px', fontSize: '1.05rem', margin: '0' }}>
            {article.summary}
          </p>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
            <Clock size={14} /> {formatDate(article.created_at)}
          </div>
        </div>
      </Link>
    </div>
  );
};
