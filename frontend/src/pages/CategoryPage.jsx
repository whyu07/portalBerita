import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArticleCard } from '../components/news/ArticleCard';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { Folder, ArrowLeft } from 'lucide-react';
import { NotFound } from './NotFound';

export const CategoryPage = () => {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      setLoading(true);
      setError(null);
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
        setError('Gagal memuat artikel untuk kategori ini.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryArticles();
  }, [slug]);

  if (!loading && !category && !error) {
    return <NotFound />;
  }

  return (
    <main className="main-content">
      <Link to="/" className="btn btn-outline btn-sm mb-6">
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      <div className="ui-panel">
        <div className="d-flex align-center text-primary mb-2" style={{ gap: '0.75rem' }}>
          <Folder size={24} />
          <span className="text-sm font-bold text-uppercase">KATEGORI</span>
        </div>
        {loading && !category ? (
          <div style={{ height: '40px', width: '200px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }} className="skeleton" />
        ) : (
          <>
            <h1 className="text-4xl mb-2">{category ? category.name : slug}</h1>
            {category?.description && <p className="text-muted">{category.description}</p>}
          </>
        )}
      </div>

      {error ? (
        <div className="text-center p-4 text-danger" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-lg)' }}>
          {error}
        </div>
      ) : loading ? (
        <div className="news-grid">
          {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState title="Belum ada artikel" description="Kategori ini belum memiliki berita saat ini." />
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
