import React from 'react';
import { HeroCard } from './news/HeroCard';

export const HeroNews = ({ articles = [] }) => {
  const heroArticles = articles.slice(0, 5);

  if (heroArticles.length === 0) return null;

  return (
    <section className="hero-news-section" aria-labelledby="hero-news-heading">
      <h2 id="hero-news-heading" className="sr-only">Berita Utama</h2>

      <div className={`hero-grid hero-grid--count-${heroArticles.length}`}>
        <div className="hero-lead-column">
          <HeroCard article={heroArticles[0]} variant="lead" />
          {heroArticles[4] && <HeroCard article={heroArticles[4]} variant="teaser" />}
        </div>

        {heroArticles.length > 1 && (
          <div className="hero-side-grid">
            <HeroCard article={heroArticles[1]} variant="side-feature" />

            <div className="hero-side-bottom">
              {heroArticles[2] && <HeroCard article={heroArticles[2]} variant="side-image" />}
              {heroArticles[3] && <HeroCard article={heroArticles[3]} variant="side-text" />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
