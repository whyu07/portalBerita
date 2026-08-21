import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Flame, Zap, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import logo from '../../../image.png';
import api from '../services/api';

export const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories in footer:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="logo-brand" style={{ marginBottom: '1rem' }}>
            <img src={logo} alt="Portal Berita Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '320px' }}>
            Menyajikan berita terkini, akurat, dan terpercaya seputar teknologi, politik, ekonomi, dan olahraga di Indonesia maupun internasional.
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Kategori Berita</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {categories.slice(0, 5).map(cat => (
              <li key={cat.id}><Link to={`/category/${cat.slug}`}>{cat.name}</Link></li>
            ))}
            {categories.length === 0 && <li>Memuat kategori...</li>}
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Navigasi</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/">Beranda Utama</Link></li>
            <li><Link to="/indeks">Indeks Berita</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RUAS Media</p>
      </div>
    </footer>
  );
};
