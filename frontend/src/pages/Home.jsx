import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { BreakingTicker } from '../components/BreakingTicker';
import { TrendingUp, Sparkles, Folder } from 'lucide-react';

export const Home = () => {
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [artRes, catRes] = await Promise.all([
          api.get(`/articles?search=${encodeURIComponent(searchQuery)}`),
          api.get('/categories')
        ]);

        const allArticles = artRes.data?.data || [];
        setArticles(allArticles);
        setCategories(catRes.data || []);

        const feat = allArticles.find((a) => a.is_featured) || allArticles[0];
        setFeatured(feat);
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  return (
    <>
      <BreakingTicker articles={articles.slice(0, 5)} />
      
      <main className="main-content">
        {searchQuery && (
          <div style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
            <h2>Hasil pencarian untuk: <span style={{ color: 'var(--accent-primary)' }}>"{searchQuery}"</span></h2>
          </div>
        )}

        {/* Featured Hero Article */}
        {!searchQuery && featured && (
          <div className="hero-article">
            <img
              src={featured.thumbnail_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80'}
              alt={featured.title}
              className="hero-img"
            />
            <div className="hero-overlay">
              {featured.category && (
                <span className="badge-category" style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none' }}>
                  <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  UTAMA • {featured.category.name}
                </span>
              )}
              <h1 className="hero-title">
                <Link to={`/article/${featured.slug}`}>{featured.title}</Link>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '750px', fontSize: '1.05rem' }}>
                {featured.summary}
              </p>
            </div>
          </div>
        )}

        {/* Main Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', marginTop: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.6rem' }}>
            <TrendingUp style={{ color: 'var(--accent-primary)' }} /> Berita Terkini
          </h2>
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <Link to="/" className="btn btn-primary btn-sm">Semua</Link>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="btn btn-outline btn-sm">
              <Folder size={14} /> {cat.name}
            </Link>
          ))}
        </div>

        {/* Article Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Memuat berita terbaru...
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <h3>Belum ada berita ditemukan</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Silakan coba pencarian atau kata kunci lain.</p>
          </div>
        ) : (
          <div className="news-grid">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};
