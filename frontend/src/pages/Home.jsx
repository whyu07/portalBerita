import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

import { BreakingTicker } from '../components/BreakingTicker';
import { HeroNews } from '../components/HeroNews';
import { LatestNews } from '../components/LatestNews';
import { PopularNews } from '../components/PopularNews';
import { CategorySection } from '../components/CategorySection';
import { EditorChoice } from '../components/EditorChoice';
import { ArticleCard } from '../components/ArticleCard';

export const Home = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [artRes, catRes] = await Promise.all([
          api.get(`/articles?search=${encodeURIComponent(searchQuery)}&limit=20`),
          api.get('/categories')
        ]);

        setAllArticles(artRes.data?.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  // Derived data
  const featured = allArticles.find((a) => a.is_featured) || allArticles[0];
  const latestArticles = allArticles.filter(a => a.id !== featured?.id).slice(0, 4);
  const moreLatestArticles = allArticles.filter(a => a.id !== featured?.id).slice(4, 9);

  if (loading) {
    return (
      <main className="main-content text-center p-4">
        Memuat data portal berita...
      </main>
    );
  }

  // If search query is active, render search results instead of complex homepage
  if (searchQuery) {
    return (
      <main className="main-content">
        <div className="ui-panel mb-8">
          <h2 className="text-2xl font-bold">Hasil pencarian untuk: <span className="text-primary">"{searchQuery}"</span></h2>
          <p className="text-muted mt-2">Ditemukan {allArticles.length} artikel</p>
        </div>
        
        {allArticles.length === 0 ? (
          <div className="text-center p-4">
            <h2 className="text-2xl font-bold mb-4">Tidak ada artikel yang cocok dengan pencarian Anda.</h2>
            <Link to="/" className="btn btn-outline mt-4">Kembali ke Beranda</Link>
          </div>
        ) : (
          <div className="news-grid">
            {allArticles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </main>
    );
  }

  return (
    <>
      <BreakingTicker />
      
      <main className="main-content">
        {/* 1. Hero Section (65/35) - Kiri Featured, Kanan Latest */}
        <HeroNews featured={featured} latest={latestArticles} />

        {/* 2. Grid Utama (70/30) - Kiri (Terbaru & Editor's Choice), Kanan (Terpopuler) */}
        <div className="two-column-layout mb-8">
          <div>
            {moreLatestArticles.length > 0 && (
              <LatestNews articles={moreLatestArticles} />
            )}
            <EditorChoice />
          </div>
          <div>
            <PopularNews period="7d" />
          </div>
        </div>

        {/* 4. Category Sections */}
        {categories.slice(0, 5).map(cat => (
          <CategorySection key={cat.id} category={cat} />
        ))}

      </main>
    </>
  );
};
