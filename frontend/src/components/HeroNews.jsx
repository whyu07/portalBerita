import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock } from 'lucide-react';

export const HeroNews = ({ featured, latest }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleImageError = (e) => {
    e.target.onerror = null; // prevent infinite loop
    e.target.src = 'https://placehold.co/600x400/1e293b/ffffff?text=404+Image+Not+Found';
  };

  return (
    <div className="hero-grid">
      {/* Kolom Kiri: Main Headline */}
      {featured && (
        <div className="hero-main">
          <Link to={`/article/${featured.slug}`}>
            <img
              src={featured.thumbnail_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80'}
              alt={featured.title}
              className="hero-main-img"
              onError={handleImageError}
            />
            <div className="hero-overlay">
              {featured.category && (
                <span className="badge-category" style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none' }}>
                  <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  UTAMA • {featured.category.name}
                </span>
              )}
              <h1 className="hero-title">{featured.title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '750px', fontSize: '1.05rem', margin: '0' }}>
                {featured.summary}
              </p>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                {formatDate(featured.created_at)}
              </div>
            </div>
          </Link>
        </div>
      )}

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
                {article.category && (
                  <Link to={`/category/${article.category.slug}`} style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {article.category.name}
                  </Link>
                )}
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
