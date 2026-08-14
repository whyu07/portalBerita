import React from 'react';
import { Flame } from 'lucide-react';

export const BreakingTicker = ({ articles = [] }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="ticker-bar">
      <div className="ticker-inner">
        <span className="ticker-badge">
          <Flame size={12} style={{ display: 'inline', marginRight: '4px' }} />
          BREAKING NEWS
        </span>
        <marquee scrollamount="5" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {articles.map((art, idx) => (
            <span key={art.id} style={{ marginRight: '3rem' }}>
              📌 {art.title} ({art.category?.name || 'Berita'})
            </span>
          ))}
        </marquee>
      </div>
    </div>
  );
};
