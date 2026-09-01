import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const BreakingTicker = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const res = await api.get('/breaking-news');
        setArticles(res.data || []);
      } catch (err) {
        console.error("Gagal memuat breaking news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBreaking();
  }, []);

  if (loading || articles.length === 0) return null;

  return (
    <div className="ticker-bar">
      <div className="ticker-inner">
        <span className="ticker-badge">
          <Flame size={12} style={{ display: 'inline', marginRight: '4px' }} />
          BREAKING NEWS
        </span>
        <marquee scrollamount="5" style={{ fontWeight: 500 }}>
          {articles.map((art) => (
            <span key={art.id} style={{ marginRight: '3rem' }}>
              <Link to={`/article/${art.slug}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-accent-primary">
                📌 {art.title} ({art.category?.name || 'Berita'})
              </Link>
            </span>
          ))}
        </marquee>
      </div>
    </div>
  );
};
