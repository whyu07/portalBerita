import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

import { BreakingTicker } from '../components/BreakingTicker';
import { HeroNews } from '../components/HeroNews';
import { LatestNews } from '../components/LatestNews';
import { PopularNews } from '../components/PopularNews';
import { ArticleCard } from '../components/news/ArticleCard';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton, CardSkeleton } from '../components/common/Skeleton';

export const Home = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const artRes = await api.get(`/articles?search=${encodeURIComponent(searchQuery)}&limit=20`);

        setAllArticles(artRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
        setError('Gagal memuat data halaman beranda.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  // Derived data
  const featured = allArticles.find((a) => a.is_featured) || allArticles[0];
  const latestArticles = allArticles.filter(a => a.id !== featured?.id).slice(0, 4);
  const latestNewsArticles = allArticles
    .filter(a => a.id !== featured?.id)
    .slice(0, 14);

  if (error) {
    return (
      <main className="main-content text-center p-4">
        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  // If search query is active, render search results instead of complex homepage
  if (searchQuery) {
    return (
      <main className="main-content landing-page">
        <div className="ui-panel mb-8">
          <h2 className="text-2xl font-bold">Hasil pencarian untuk: <span className="text-primary">"{searchQuery}"</span></h2>
          <p className="text-muted mt-2">Ditemukan {allArticles.length} artikel</p>
        </div>
        
        {loading ? (
          <div className="news-grid">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : allArticles.length === 0 ? (
          <EmptyState 
            title="Tidak ada hasil" 
            description="Tidak ada artikel yang cocok dengan pencarian Anda." 
            actionLabel="Kembali ke Beranda"
            onAction={() => window.location.href = '/'}
          />
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
      
      <main className="main-content landing-page">
        {loading ? (
          <>
            <div className="hero-grid mb-8">
              <Skeleton style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
              <div>
                <Skeleton style={{ height: '30px', width: '150px', marginBottom: '1rem' }} />
                {[1,2,3,4].map(i => <Skeleton key={i} style={{ height: '80px', marginBottom: '0.75rem', borderRadius: 'var(--radius-sm)' }} />)}
              </div>
            </div>
            <div className="two-column-layout landing-content-layout mb-8">
              <div className="news-grid">
                {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
              </div>
              <div>
                <Skeleton style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 1. Hero Section (65/35) - Kiri Featured, Kanan Latest */}
            <HeroNews featured={featured} latest={latestArticles} />

            {/* 2. Grid Utama (70/30) - Latest News dan Trending/Popular News */}
            <div className="two-column-layout landing-content-layout mb-8">
              <div>
                <LatestNews articles={latestNewsArticles} />
              </div>
              <div>
                <PopularNews period="7d" />
              </div>
            </div>

          </>
        )}
      </main>
    </>
  );
};
