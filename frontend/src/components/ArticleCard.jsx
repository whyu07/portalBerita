import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, User } from 'lucide-react';

export const ArticleCard = ({ article }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <article className="card-news" id={`article-card-${article.id}`}>
      <Link to={`/article/${article.slug}`} className="card-img-wrapper">
        <img
          src={article.thumbnail_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'}
          alt={article.title}
          loading="lazy"
        />
      </Link>
      <div className="card-body">
        {article.category && (
          <Link to={`/category/${article.category.slug}`} className="badge-category">
            {article.category.name}
          </Link>
        )}
        <h3 className="card-title">
          <Link to={`/article/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="card-summary">{article.summary || article.content?.substring(0, 120) + '...'}</p>
        <div className="card-footer-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={14} /> {article.author?.name || 'Redaksi'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> {formatDate(article.created_at)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={14} /> {article.views_count || 0}
          </span>
        </div>
      </div>
    </article>
  );
};
