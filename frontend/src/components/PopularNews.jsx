import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const PopularNewsLoading = () => (
  <aside className="popular-news-panel" aria-labelledby="popular-news-heading">
    <div className="popular-news-heading">
      <h2 id="popular-news-heading">Terpopuler</h2>
    </div>
    <div className="popular-news-loading" aria-live="polite">
      Memuat berita populer...
    </div>
  </aside>
);

export const PopularNews = ({ period = '7d' }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      setLoading(true);

      try {
        const res = await api.get(`/articles/popular?period=${period}&limit=5`);
        setArticles(res.data?.data || []);
      } catch (err) {
        console.error('Gagal mengambil berita populer:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, [period]);

  if (loading) return <PopularNewsLoading />;

  return (
    <aside className="popular-news-panel" aria-labelledby="popular-news-heading">
      <div className="popular-news-heading">
        <h2 id="popular-news-heading">Terpopuler</h2>
      </div>

      {articles.length === 0 ? (
        <p className="popular-news-empty">Belum ada berita populer untuk periode ini.</p>
      ) : (
        <ol className="popular-news-list">
          {articles.map((article, index) => (
            <li key={article.id} className="popular-news-item">
              <span className="popular-news-rank" aria-hidden="true">
                {index + 1}
              </span>
              <div className="popular-news-content">
                <Link to={`/article/${article.slug}`} className="popular-news-title">
                  {article.title}
                </Link>
                <div className="popular-news-meta">
                  {article.category?.slug ? (
                    <Link to={`/category/${article.category.slug}`}>
                      {article.category.name}
                    </Link>
                  ) : article.category?.name ? (
                    <span>{article.category.name}</span>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
};
