import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Folder, Hash, Star, Users, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../../../image.png';

export const DashboardSidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="dashboard-sidebar">
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src={logo} alt="Portal Berita" style={{ height: '32px', width: 'auto' }} />
        <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Dashboard</span>
      </div>
      
      <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <button 
          onClick={() => setActiveTab('articles')}
          className={`btn ${activeTab === 'articles' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ justifyContent: 'flex-start', width: '100%', marginBottom: '0.5rem' }}
        >
          <FileText size={18} /> Daftar Artikel
        </button>
        
        <button 
          onClick={() => setActiveTab('categories')}
          className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ justifyContent: 'flex-start', width: '100%', marginBottom: '0.5rem' }}
        >
          <Folder size={18} /> Kategori Berita
        </button>

        {user?.role === 'admin' && (
          <>
            <button 
              onClick={() => setActiveTab('tags')}
              className={`btn ${activeTab === 'tags' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%', marginBottom: '0.5rem' }}
            >
              <Hash size={18} /> Master Tag
            </button>
            <button 
              onClick={() => setActiveTab('popular')}
              className={`btn ${activeTab === 'popular' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%', marginBottom: '0.5rem' }}
            >
              <Star size={18} /> Popular News
            </button>
            <button 
              onClick={() => setActiveTab('accounts')}
              className={`btn ${activeTab === 'accounts' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%', marginBottom: '0.5rem' }}
            >
              <Users size={18} /> Pengaturan Akun
            </button>
          </>
        )}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Role: {user?.role}</div>
        </div>
        
        <Link to="/" className="btn btn-outline btn-sm" style={{ width: '100%', marginBottom: '0.5rem', justifyContent: 'center' }}>
          <ArrowLeft size={16} /> Ke Halaman Publik
        </Link>
        <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ width: '100%', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)', justifyContent: 'center' }}>
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </aside>
  );
};
