import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryBadge } from './news/CategoryBadge';

const FALLBACK_IMAGE = 'https://placehold.co/900x600/1e293b/ffffff?text=News+Image';

const formatDate = (dateStr) => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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

const ArticleMeta = ({ article, light = false }) => (
  <div className={`latest-news-meta${light ? ' latest-news-meta--light' : ''}`}>
    <span>Oleh {article.author?.name || 'Redaksi'}</span>
    <span>{formatDate(article.created_at)}</span>
  </div>
);

const LeadNewsCard = ({ article }) => (
  <article className="latest-news-card latest-news-card--lead">
    <Link
      to={`/article/${article.slug}`}
      className="latest-news-card__image-link"
      aria-label={`Baca berita: ${article.title}`}
    >
      <img
        src={article.thumbnail_url || FALLBACK_IMAGE}
        alt={article.title}
        className="latest-news-card__image"
        onError={handleImageError}
      />
      <div className="latest-news-card__overlay">
        <CategoryBadge category={article.category} className="latest-news-card__badge" asLink={false} />
        <h3>{article.title}</h3>
        <ArticleMeta article={article} light />
      </div>
    </Link>
  </article>
);

const TextNewsCard = ({ article }) => (
  <article className="latest-news-card latest-news-card--text">
    <Link
      to={`/article/${article.slug}`}
      className="latest-news-card__text-link"
      aria-label={`Baca berita: ${article.title}`}
    >
      <div className="latest-news-card__body">
        <h3>{article.title}</h3>
        <p>{getSummary(article)}</p>
        <ArticleMeta article={article} />
      </div>
    </Link>
  </article>
);

export const LatestNews = ({ articles = [] }) => {
  if (articles.length === 0) return null;

  const visibleArticles = articles.slice(0, 14);
  const articleRows = [];

  for (let index = 0; index < visibleArticles.length; index += 2) {
    articleRows.push(visibleArticles.slice(index, index + 2));
  }

  return (
    <section className="latest-news-section" aria-labelledby="latest-news-heading">
      <div className="latest-news-heading">
        <h2 id="latest-news-heading">Berita Terbaru</h2>
        <span aria-hidden="true" />
      </div>

      <div className="latest-news-grid">
        {articleRows.map((row, rowIndex) => (
          <div
            key={`latest-news-row-${rowIndex}`}
            className={`latest-news-row ${rowIndex % 2 === 0 ? 'latest-news-row--media' : 'latest-news-row--text'}`}
          >
            {row.map((article) => (
              rowIndex % 2 === 0 ? (
                <LeadNewsCard key={article.id} article={article} />
              ) : (
                <TextNewsCard key={article.id} article={article} />
              )
            ))}
          </div>
        ))}
      </div>

      <div className="latest-news-actions">
        <Link to="/indeks" className="btn btn-outline">
          Lihat Semua
        </Link>
      </div>
    </section>
  );
};
