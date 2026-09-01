import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';

const FALLBACK_IMAGE = 'https://placehold.co/1200x800/1e293b/ffffff?text=News+Image';

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

const getSummary = (article, maxLength = 125) => {
  if (article.summary) return article.summary;
  if (!article.content) return 'Tidak ada ringkasan untuk artikel ini.';

  const plainText = article.content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.substring(0, maxLength)}...`;
};

const getContentSnippet = (article, maxLength = 320) => {
  if (!article.content) return 'Belum ada isi artikel.';
  const plainText = article.content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.substring(0, maxLength)}...`;
};

const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
};

const ArticleMeta = ({ article, light = false }) => (
  <div className={`hero-card__meta${light ? ' hero-card__meta--light' : ''}`}>
    <span>
      <User size={11} aria-hidden="true" />
      {article.author?.name || 'Redaksi'}
    </span>
    <span>
      <Clock size={11} aria-hidden="true" />
      {formatDate(article.published_at || article.created_at)}
    </span>
  </div>
);

export const HeroCard = ({ article, variant = 'lead' }) => {
  if (!article) return null;

  const isTextCard = variant === 'side-text';
  const cardClass = `hero-card hero-card--${variant}`;



  if (variant === 'side-feature') {
    return (
      <article className={cardClass}>
        <Link
          to={`/article/${article.slug}`}
          className="hero-card__side-feature-link"
          aria-label={`Baca berita: ${article.title}`}
        >
          <div className="hero-card__feature-copy">
            <p>{getContentSnippet(article, 320)}</p>
          </div>
          <div className="hero-card__feature-media">
            <img
              src={article.thumbnail_url || FALLBACK_IMAGE}
              alt={article.title}
              className="hero-card__image"
              onError={handleImageError}
            />
            <div className="hero-card__feature-overlay">
              <h3>{article.title}</h3>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'teaser') {
    return (
      <article className={cardClass}>
        <Link
          to={`/article/${article.slug}`}
          className="hero-card__teaser-link"
          aria-label={`Baca berita: ${article.title}`}
        >
          <div className="hero-card__teaser-content">
            <h3>{article.title}</h3>
            <p>{getSummary(article)}</p>
            <ArticleMeta article={article} />
          </div>
          <img
            src={article.thumbnail_url || FALLBACK_IMAGE}
            alt={article.title}
            className="hero-card__teaser-image"
            onError={handleImageError}
          />
        </Link>
      </article>
    );
  }

  if (isTextCard) {
    return (
      <article className={cardClass}>
        <Link
          to={`/article/${article.slug}`}
          className="hero-card__text-link"
          aria-label={`Baca berita: ${article.title}`}
        >
          <div className="hero-card__text-content">
            <CategoryBadge category={article.category} className="hero-card__category" asLink={false} />
            <h3>{article.title}</h3>
            <p>{getSummary(article)}</p>
            <ArticleMeta article={article} />
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className={cardClass}>
      <Link
        to={`/article/${article.slug}`}
        className="hero-card__image-link"
        aria-label={`Baca berita: ${article.title}`}
      >
        <img
          src={article.thumbnail_url || FALLBACK_IMAGE}
          alt={article.title}
          className="hero-card__image"
          onError={handleImageError}
        />
        <div className="hero-card__overlay">
          <div className="hero-card__dots" aria-hidden="true">
            <span className="is-active" />
            <span />
            <span />
            <span />
            <span />
          </div>
          <CategoryBadge category={article.category} className="hero-card__category" asLink={false} />
          <h3>{article.title}</h3>
          <p>{getSummary(article)}</p>
          <ArticleMeta article={article} light />
        </div>
      </Link>
    </article>
  );
};
