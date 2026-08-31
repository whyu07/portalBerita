import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { ArticleCard } from '../components/news/ArticleCard';
import { Pagination } from '../components/common/Pagination';
import { FilterBar } from '../components/dashboard/FilterBar';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton, CardSkeleton } from '../components/common/Skeleton';

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

  const filters = [
    {
      key: 'category',
      label: 'Kanal',
      type: 'select',
      value: category,
      onChange: (val) => handleFilterChange('category', val),
      options: categories.map(c => ({ value: c.slug, label: c.name }))
    },
    {
      key: 'date_from',
      label: 'Mulai Tanggal',
      type: 'date',
      value: dateFrom,
      onChange: (val) => handleFilterChange('date_from', val),
      max: dateTo || undefined
    },
    {
      key: 'date_to',
      label: 'Sampai Tanggal',
      type: 'date',
      value: dateTo,
      onChange: (val) => handleFilterChange('date_to', val),
      min: dateFrom || undefined
    }
  ];

  return (
    <div className="page-container mt-4 mb-8">
      <header className="mb-8">
        <h1 className="text-4xl mb-2">Indeks Berita</h1>
        <p className="text-muted">
          {total} berita ditemukan
        </p>
      </header>

      {/* Filter Section */}
      <FilterBar filters={filters} onReset={handleResetFilter} />

      {error && (
        <div className="text-center p-4 text-danger" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-lg)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="news-grid">
          {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <EmptyState 
              title="Tidak ada berita pada filter ini."
              actionLabel="Reset Filter"
              onAction={handleResetFilter}
            />
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
