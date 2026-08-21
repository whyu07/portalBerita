import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Newspaper, Search, User, LogOut, Sun, Moon, LayoutDashboard } from 'lucide-react';
import logo from '../../../image.png';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('portal_theme') || 'dark');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portal_theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="navbar-sticky">
      <div className="navbar-inner">
        <Link to="/" className="logo-brand">
          <img src={logo} alt="Portal Berita Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cari berita terkini..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="nav-search-input"
          />
        </form>

        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Beranda
            </Link>
          </li>
          {categories.slice(0, 5).map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/category/${cat.slug}`}
                className={`nav-link ${location.pathname === `/category/${cat.slug}` ? 'active' : ''}`}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-outline btn-sm"
            title="Ganti Tema"
            id="btn-toggle-theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {(user.role === 'admin' || user.role === 'author') && (
                <Link to="/ruasdash" className="btn btn-outline btn-sm" id="nav-admin-dashboard-link">
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {user.name}
              </div>
              <button onClick={logout} className="btn btn-outline btn-sm" title="Keluar" id="btn-nav-logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
