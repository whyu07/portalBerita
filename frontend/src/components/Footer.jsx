import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="logo-brand" style={{ marginBottom: '1rem' }}>
            <div className="logo-icon">
              <Newspaper size={20} />
            </div>
            <span>PORTAL BERITA</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '320px' }}>
            Menyajikan berita terkini, akurat, dan terpercaya seputar teknologi, politik, ekonomi, dan olahraga di Indonesia maupun internasional.
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Kategori Berita</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/category/teknologi">Teknologi & AI</Link></li>
            <li><Link to="/category/politik">Politik & Pemerintahan</Link></li>
            <li><Link to="/category/ekonomi">Ekonomi & Bisnis</Link></li>
            <li><Link to="/category/olahraga">Olahraga</Link></li>
            <li><Link to="/category/hiburan">Hiburan & Lifestyle</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Navigasi</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/">Beranda Utama</Link></li>
            <li><Link to="/login">Masuk Akun</Link></li>
            <li><Link to="/register">Pendaftaran Member</Link></li>
            <li><Link to="/admin">Dashboard Admin</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Portal Berita (React + Go Gin + PostgreSQL). Hak Cipta Dilindungi.</p>
      </div>
    </footer>
  );
};
