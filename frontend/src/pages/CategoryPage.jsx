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
      <Link to="/" className="btn btn-outline btn-sm mb-6">
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      <div className="ui-panel">
        <div className="d-flex align-center text-primary mb-2" style={{ gap: '0.75rem' }}>
          <Folder size={24} />
          <span className="text-sm font-bold text-uppercase">KATEGORI</span>
        </div>
        <h1 className="text-4xl mb-2">{category ? category.name : slug}</h1>
        {category?.description && <p className="text-muted">{category.description}</p>}
      </div>

      {loading ? (
        <div className="text-center p-4 text-muted">
          Memuat artikel...
        </div>
      ) : articles.length === 0 ? (
        <div className="ui-panel text-center">
          <p className="text-muted">Belum ada artikel dalam kategori ini.</p>
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
