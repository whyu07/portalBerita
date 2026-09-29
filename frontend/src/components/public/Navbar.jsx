import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Newspaper, Search, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const logo = '/image.png';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="navbar-sticky">
      <div className="navbar-inner navbar-primary-row">
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

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user-actions">
              {(user.role === 'admin' || user.role === 'author') && (
                <Link to="/ruasdash" className="btn btn-outline btn-sm" id="nav-admin-dashboard-link">
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <div className="navbar-user-name">
                {user.name}
              </div>
              <button onClick={logout} className="btn btn-outline btn-sm" title="Keluar" id="btn-nav-logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="navbar-user-actions" />
          )}
        </div>
      </div>

      <nav className="navbar-category-row" aria-label="Navigasi utama">
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
      </nav>
    </header>
  );
};
