import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import api from '../services/api';

export const PopularNews = ({ period = '7d' }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await api.get(`/articles/popular?period=${period}&limit=5`);
        setArticles(res.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil berita populer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, [period]);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
        <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', width: '100%', borderBottom: '2px solid var(--accent-primary)' }}>
          Terpopuler
        </h3>
        <p>Memuat...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
        <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', width: '100%', borderBottom: '2px solid var(--accent-primary)' }}>
          Terpopuler
        </h3>
        <p className="text-gray-500">Belum ada berita populer untuk periode ini.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
      <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', width: '100%', borderBottom: '2px solid var(--accent-primary)' }}>
        Terpopuler
      </h3>
      <div className="popular-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {articles.map((article, idx) => (
          <div key={article.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', opacity: 0.5, lineHeight: 1 }}>
              {idx + 1}
            </div>
            <div>
              <Link to={`/article/${article.slug}`} style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-primary)', textDecoration: 'none' }} className="popular-title hover:text-indigo-600 transition-colors">
                {article.title}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {article.category && (
                  <span style={{ color: 'var(--accent-primary)' }}>{article.category.name}</span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Eye size={14} /> {article.period_views}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
