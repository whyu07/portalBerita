import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Pagination = ({ page, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`pagination d-flex justify-center align-center ${className}`} style={{ gap: '1rem', marginTop: '2rem', padding: '1rem 0' }}>
      <Button 
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => {
          onPageChange(page - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        icon={<ChevronLeft size={16} />}
      >
        Sebelumnya
      </Button>
      
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
        Halaman {page} dari {totalPages}
      </span>
      
      <Button 
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => {
          onPageChange(page + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        Berikutnya <ChevronRight size={16} style={{ marginLeft: '4px' }} />
      </Button>
    </div>
  );
};
