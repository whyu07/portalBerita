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
    <div className="container mt-4 mb-8">
      <header className="mb-8">
        <h1 className="text-4xl mb-2">Indeks Berita</h1>
        <p className="text-muted">
          {total} berita ditemukan
        </p>
      </header>

      {/* Filter Section */}
      <div className="ui-panel d-flex flex-wrap mb-8" style={{ gap: '1rem' }}>
        <div className="form-group flex-1" style={{ minWidth: '200px' }}>
          <label className="form-label">Kanal</label>
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
        
        <div className="form-group flex-1" style={{ minWidth: '150px' }}>
          <label className="form-label">Mulai Tanggal</label>
          <input 
            type="date" 
            className="form-control" 
            value={dateFrom}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            max={dateTo || undefined}
          />
        </div>
        
        <div className="form-group flex-1" style={{ minWidth: '150px' }}>
          <label className="form-label">Sampai Tanggal</label>
          <input 
            type="date" 
            className="form-control" 
            value={dateTo}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            min={dateFrom || undefined}
          />
        </div>

        <div className="d-flex" style={{ alignItems: 'flex-end', flex: '1 1 100px' }}>
          <button onClick={handleResetFilter} className="btn btn-outline" style={{ width: '100%', height: '42px' }}>
            Reset Filter
          </button>
        </div>
      </div>

      {error && (
        <div className="text-center p-4 text-danger" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-lg)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-4 text-muted">
          Memuat indeks berita...
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div className="ui-panel text-center">
              <h3 className="text-lg font-bold mb-4">Tidak ada berita pada filter ini.</h3>
              <button onClick={handleResetFilter} className="btn btn-primary">Reset Filter</button>
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
