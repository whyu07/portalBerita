import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ArticleCard } from './news/ArticleCard';

export const EditorChoice = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/articles?featured=true&limit=6');
        setArticles(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load Editor Choice articles', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || articles.length === 0) return null;

  return (
    <div style={{ marginBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="section-title">Editor's Choice</h2>
      </div>
      <div className="news-grid">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};
