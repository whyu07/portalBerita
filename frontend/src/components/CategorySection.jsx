import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const CategorySection = ({ category }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      try {
        const res = await api.get(`/articles?category=${category.slug}&limit=4`);
        setArticles(res.data?.data || []);
      } catch (err) {
        console.error(`Failed to load articles for ${category.name}`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryArticles();
  }, [category]);

  if (loading) return null; // or a skeleton
  if (articles.length === 0) return null;

  const featured = articles[0];
  const others = articles.slice(1);

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div className="section-header-flex">
        <h2 className="section-title">{category.name}</h2>
        <Link to={`/category/${category.slug}`} style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          Lihat Semua &rarr;
        </Link>
      </div>

      <div className="category-section-grid">
        {featured && (
          <div className="category-featured">
            <Link to={`/article/${featured.slug}`}>
              <div style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                <img 
                  src={featured.thumbnail_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'} 
                  alt={featured.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{featured.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {featured.summary || featured.content?.substring(0, 150) + '...'}
              </p>
            </Link>
          </div>
        )}

        {others.map(article => (
          <div key={article.id}>
            <Link to={`/article/${article.slug}`}>
              <div style={{ width: '100%', height: '150px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <img 
                  src={article.thumbnail_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'} 
                  alt={article.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h4 style={{ fontSize: '1.1rem', lineHeight: 1.3 }}>{article.title}</h4>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
