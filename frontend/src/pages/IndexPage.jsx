import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { Pagination } from '../components/Pagination';

export default function IndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Derived state from URL
  const page = parseInt(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch articles whenever searchParams change
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 12);
        if (category) params.append('category', category);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        const response = await api.get(`/articles?${params.toString()}`);
        setArticles(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.total_pages || 1);
      } catch (err) {
        setError(err.response?.data?.error || "Gagal memuat indeks berita.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [page, category, dateFrom, dateTo]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    // special case for page, don't reset it
    if (key !== 'page') {
      newParams.set('page', '1');
    }

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    setSearchParams(newParams);
  };

  const handleResetFilter = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Indeks Berita</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {total} berita ditemukan
        </p>
      </header>

      {/* Filter Section */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        flexWrap: 'wrap', 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        background: 'var(--bg-secondary)', 
        borderRadius: 'var(--radius-lg)' 
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Kanal</label>
          <select 
            className="form-control" 
            value={category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Semua Kanal</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Mulai Tanggal</label>
          <input 
            type="date" 
            className="form-control" 
            value={dateFrom}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            max={dateTo || undefined}
          />
        </div>
        
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Sampai Tanggal</label>
          <input 
            type="date" 
            className="form-control" 
            value={dateTo}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            min={dateFrom || undefined}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={handleResetFilter} className="btn btn-outline" style={{ height: '42px', width: '100%' }}>
            Reset Filter
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 'var(--radius-lg)' }}>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Memuat indeks berita...
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Tidak ada berita pada filter ini.</h3>
              <button onClick={handleResetFilter} className="btn btn-primary">Tampilkan Semua Berita</button>
            </div>
          ) : (
            <div className="news-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
          
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            onPageChange={(p) => handleFilterChange('page', p.toString())} 
          />
        </>
      )}
    </div>
  );
}
