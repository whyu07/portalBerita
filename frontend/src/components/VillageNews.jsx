import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const FALLBACK_IMAGE = 'https://placehold.co/800x600/1e293b/ffffff?text=Jurnal+Desa';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) + ' - ' + date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace('.', ':');
};

const VillageNewsLoading = () => (
  <aside className="village-news-panel" aria-labelledby="village-news-heading">
    <div className="village-news-heading">
      <div className="village-news-icon"></div>
      <h2 id="village-news-heading">Jurnal Desa</h2>
    </div>
    <div className="village-news-loading" aria-live="polite">
      Memuat Jurnal Desa...
    </div>
  </aside>
);

export const VillageNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillageNews = async () => {
      setLoading(true);
      try {
        // Ambil daftar kategori untuk mencari kategori 'Desa' atau 'Jurnal Desa'
        const catRes = await api.get('/categories');
        const categories = catRes.data || [];
        const desaCat = categories.find(c => 
          c.slug === 'desa' || 
          c.slug === 'jurnal-desa' || 
          c.name?.toLowerCase().includes('desa')
        );

        if (desaCat) {
          const res = await api.get(`/articles?category=${encodeURIComponent(desaCat.slug)}&limit=3`);
          setArticles(res.data?.data || []);
        } else {
          // Jika kategori desa belum ada di database, query category=desa (mengembalikan data kosong [])
          const res = await api.get('/articles?category=desa&limit=3');
          setArticles(res.data?.data || []);
        }
      } catch (err) {
        console.error('Gagal mengambil berita Jurnal Desa:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVillageNews();
  }, []);

  if (loading) return <VillageNewsLoading />;

  const paddedArticles = [...articles];
  while (paddedArticles.length < 3) {
    paddedArticles.push({ isBlank: true, id: `blank-${paddedArticles.length}` });
  }

  const leadArticle = paddedArticles[0];
  const listArticles = paddedArticles.slice(1, 3);

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <aside className="village-news-panel" aria-labelledby="village-news-heading">
      <div className="village-news-heading">
        <div className="village-news-icon"></div>
        <h2 id="village-news-heading">Jurnal Desa</h2>
      </div>

      <div className="village-news-content">
        {/* Lead Article */}
        <article className="village-news-lead">
          {leadArticle.isBlank ? (
            <div className="village-news-lead-img-wrapper" style={{ background: 'var(--border-color)' }}>
              <div className="village-news-lead-overlay" style={{ background: 'transparent' }}>
                <div style={{ width: '70%', height: '1.25rem', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                <div style={{ width: '40%', height: '0.8rem', background: 'rgba(255,255,255,0.5)', borderRadius: '4px' }}></div>
              </div>
            </div>
          ) : (
            <Link to={`/article/${leadArticle.slug}`}>
              <div className="village-news-lead-img-wrapper">
                <img
                  src={leadArticle.thumbnail_url || FALLBACK_IMAGE}
                  alt={leadArticle.title}
                  onError={handleImageError}
                />
                <div className="village-news-lead-overlay">
                  <h3 className="village-news-lead-title">{leadArticle.title}</h3>
                  <span className="village-news-lead-date">
                    {formatDate(leadArticle.published_at || leadArticle.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          )}
        </article>

        {/* List Articles */}
        <div className="village-news-list">
          {listArticles.map((article) => (
            <article key={article.id} className="village-news-item">
              {article.isBlank ? (
                <>
                  <div className="village-news-item-img-link" style={{ background: 'var(--border-color)' }}></div>
                  <div className="village-news-item-content" style={{ width: '100%', justifyContent: 'center' }}>
                    <div style={{ width: '90%', height: '1rem', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '0.35rem' }}></div>
                    <div style={{ width: '60%', height: '1rem', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '0.35rem' }}></div>
                    <div style={{ width: '40%', height: '0.75rem', background: 'var(--border-color)', borderRadius: '4px' }}></div>
                  </div>
                </>
              ) : (
                <>
                  <Link to={`/article/${article.slug}`} className="village-news-item-img-link">
                    <img
                      src={article.thumbnail_url || FALLBACK_IMAGE}
                      alt={article.title}
                      onError={handleImageError}
                    />
                  </Link>
                  <div className="village-news-item-content">
                    <Link to={`/article/${article.slug}`}>
                      <h4 className="village-news-item-title">{article.title}</h4>
                    </Link>
                    <span className="village-news-item-date">
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </aside>
  );
};
