import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';

export const ModalForm = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  submitLabel = 'Simpan',
  cancelLabel = 'Batal',
  loading = false,
  maxWidth = '600px',
  children
}) => {
  const modalRef = useRef(null);

  // Focus trap / escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        className="modal-card" 
        style={{ maxWidth, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} 
        onClick={e => e.stopPropagation()} // Prevent backdrop click from closing
        ref={modalRef}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 id="modal-title" style={{ margin: 0 }}>{title}</h2>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            {children}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
