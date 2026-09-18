import React from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMAGE = 'https://placehold.co/900x600/1e293b/ffffff?text=News+Image';

const formatDate = (dateStr) => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' -');
};

const getSummary = (article) => {
  if (article.summary) return article.summary;
  if (!article.content) return '';

  return `${article.content.substring(0, 140)}...`;
};

const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
};

const LatestNewsItem = ({ article }) => (
  <article className="news-list-item" style={{ borderBottomStyle: 'dashed' }}>
    <Link to={`/article/${article.slug}`}>
      <img 
        src={article.thumbnail_url || FALLBACK_IMAGE} 
        alt={article.title} 
        className="news-list-img"
        onError={handleImageError}
      />
    </Link>
    <div className="news-list-content">
      <Link to={`/article/${article.slug}`}>
        <h3 className="news-list-title">{article.title}</h3>
      </Link>
      <div className="news-list-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--accent-danger)', fontWeight: 'bold' }}>
          {article.category?.name || 'Umum'}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>|</span>
        <span style={{ color: 'var(--text-muted)' }}>
          {formatDate(article.published_at || article.created_at)}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {getSummary(article)}
      </p>
    </div>
  </article>
);

export const LatestNews = ({ articles = [] }) => {
  if (articles.length === 0) return null;

  const visibleArticles = articles.slice(0, 14);

  return (
    <section className="latest-news-section" aria-labelledby="latest-news-heading">
      <div className="latest-news-heading">
        <h2 id="latest-news-heading">TERBARU</h2>
      </div>

      <div className="news-list-vertical">
        {visibleArticles.map((article) => (
          <LatestNewsItem key={article.id} article={article} />
        ))}
      </div>

      <div className="latest-news-actions mt-6">
        <Link to="/indeks" className="btn btn-outline" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
          Lihat Semua
        </Link>
      </div>
    </section>
  );
};
