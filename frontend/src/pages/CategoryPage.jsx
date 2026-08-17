import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { Folder, ArrowLeft } from 'lucide-react';
import { NotFound } from './NotFound';

export const CategoryPage = () => {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      setLoading(true);
      try {
        const [artRes, catRes] = await Promise.all([
          api.get(`/articles?category=${slug}`),
          api.get('/categories')
        ]);
        setArticles(artRes.data?.data || []);

        const currentCat = catRes.data?.find((c) => c.slug === slug);
        setCategory(currentCat);
      } catch (err) {
        console.error('Failed to load category articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryArticles();
  }, [slug]);

  if (!loading && !category) {
    return <NotFound />;
  }

  return (
    <main className="main-content">
      <Link to="/" className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
          <Folder size={24} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>KATEGORI</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{category ? category.name : slug}</h1>
        {category?.description && <p style={{ color: 'var(--text-secondary)' }}>{category.description}</p>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Memuat artikel dalam kategori...
        </div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <h3>Belum ada artikel dalam kategori ini</h3>
        </div>
      ) : (
        <div className="news-grid">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      )}
    </main>
  );
};
