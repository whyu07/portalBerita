import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFound = () => {
  const location = useLocation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <AlertCircle size={64} style={{ color: 'var(--accent-danger)', marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 800 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Halaman Tidak Ditemukan</h2>
      
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        maxWidth: '500px',
        width: '100%'
      }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Maaf, halaman dengan URL <strong style={{ color: 'var(--accent-primary)', wordBreak: 'break-all' }}>{location.pathname}</strong> tidak tersedia di server ini.
        </p>
      </div>

      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <Home size={18} /> Kembali ke Beranda
      </Link>
    </div>
  );
};
