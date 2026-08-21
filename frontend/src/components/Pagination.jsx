import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', padding: '1rem 0' }}>
      <button 
        className="btn btn-outline btn-sm" 
        disabled={page <= 1}
        onClick={() => {
          onPageChange(page - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <ChevronLeft size={16} style={{ marginRight: '4px' }} /> Sebelumnya
      </button>
      
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
        Halaman {page} dari {totalPages}
      </span>
      
      <button 
        className="btn btn-outline btn-sm" 
        disabled={page >= totalPages}
        onClick={() => {
          onPageChange(page + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        Berikutnya <ChevronRight size={16} style={{ marginLeft: '4px' }} />
      </button>
    </div>
  );
};
