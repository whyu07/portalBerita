import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { HeroCard } from './news/HeroCard';
import { CategoryBadge } from './news/CategoryBadge';

export const HeroNews = ({ featured, latest }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/600x400/1e293b/ffffff?text=404+Image+Not+Found';
  };

  return (
    <div className="hero-grid">
      {/* Kolom Kiri: Main Headline */}
      {featured && <HeroCard article={featured} />}

      {/* Kolom Kanan: Berita Terkini Sidebar */}
      <div>
        <div className="section-header-flex">
          <h3 className="section-title">Berita Terkini</h3>
        </div>
        <div className="news-list-vertical">
          {latest && latest.map((article) => (
            <div key={article.id} className="news-list-item" style={{ padding: '0.75rem 0' }}>
              {article.thumbnail_url && (
                <Link to={`/article/${article.slug}`}>
                  <img src={article.thumbnail_url} alt={article.title} className="news-list-img" style={{ width: '100px', height: '70px' }} onError={handleImageError} />
                </Link>
              )}
              <div className="news-list-content">
                <CategoryBadge category={article.category} style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }} />
                <h4 className="news-list-title" style={{ fontSize: '1rem', marginTop: '0.2rem' }}>
                  <Link to={`/article/${article.slug}`}>{article.title}</Link>
                </h4>
                <div className="meta-text" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {formatDate(article.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
