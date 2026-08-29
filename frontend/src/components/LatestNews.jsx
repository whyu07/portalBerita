import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export const LatestNews = ({ articles }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/600x400/1e293b/ffffff?text=404+Image+Not+Found';
  };

  if (!articles || articles.length === 0) return null;

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div className="section-header-flex">
        <h2 className="section-title">Berita Terkini</h2>
      </div>
      <div className="news-list-vertical">
        {articles.map((article) => (
          <div key={article.id} className="news-list-item">
            {article.thumbnail_url && (
              <Link to={`/article/${article.slug}`}>
                <img src={article.thumbnail_url} alt={article.title} className="news-list-img" onError={handleImageError} />
              </Link>
            )}
            <div className="news-list-content">
              {article.category && (
                <Link to={`/category/${article.category.slug}`} className="badge-category" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  {article.category.name}
                </Link>
              )}
              <h3 className="news-list-title" style={{ fontSize: '1.25rem' }}>
                <Link to={`/article/${article.slug}`}>{article.title}</Link>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {article.summary || article.content?.substring(0, 100) + '...'}
              </p>
              <div className="meta-text" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {formatDate(article.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
