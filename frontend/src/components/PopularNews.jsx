import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export const PopularNews = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
      <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', width: '100%', borderBottom: '2px solid var(--accent-primary)' }}>
        Terpopuler
      </h3>
      <div className="popular-list">
        {articles.map((article) => (
          <div key={article.id} className="popular-item">
            <h4 className="popular-title">
              <Link to={`/article/${article.slug}`}>{article.title}</Link>
            </h4>
            <div className="meta-text" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={12} /> {article.views_count} views
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
