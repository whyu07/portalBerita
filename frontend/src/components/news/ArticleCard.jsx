import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, User } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { TagBadge } from './TagBadge';

export const ArticleCard = ({ article }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/600x400/1e293b/ffffff?text=404+Image+Not+Found';
  };

  return (
    <article className="card-news" id={`article-card-${article.id}`}>
      <Link to={`/article/${article.slug}`} className="card-img-wrapper">
        <img
          src={article.thumbnail_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'}
          alt={article.title}
          className="article-card-img"
          onError={handleImageError}
        />
      </Link>
      <div className="card-body">
        <div className="flex items-center space-x-2 mb-3">
          <CategoryBadge category={article.category} />
          {article.tags && article.tags.slice(0, 2).map(tag => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
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
