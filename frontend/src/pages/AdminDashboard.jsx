import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Newspaper, Folder, Plus, Edit, Trash2, X, Eye, FileText, CheckCircle, Users } from 'lucide-react';
import { AccountManagement } from '../components/AccountManagement';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'categories'

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    summary: '',
    content: '',
    thumbnail_url: '',
    category_id: '',
    status: 'published',
    is_featured: false,
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'author') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artRes, catRes] = await Promise.all([
        api.get('/articles?limit=100&status='),
        api.get('/categories'),
      ]);
      setArticles(artRes.data?.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Article Actions
  const handleOpenArticleModal = (art = null) => {
    if (art) {
      setEditingArticle(art);
      setArticleForm({
        title: art.title,
        summary: art.summary || '',
        content: art.content,
        thumbnail_url: art.thumbnail_url || '',
        category_id: art.category_id,
        status: art.status,
        is_featured: art.is_featured,
      });
    } else {
      setEditingArticle(null);
      setArticleForm({
        title: '',
        summary: '',
        content: '',
        thumbnail_url: '',
        category_id: categories[0]?.id || '',
        status: 'published',
        is_featured: false,
      });
    }
    setShowArticleModal(true);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...articleForm,
        category_id: Number(articleForm.category_id),
      };

      if (editingArticle) {
        await api.put(`/articles/${editingArticle.id}`, payload);
      } else {
        await api.post('/articles', payload);
      }

      setShowArticleModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan artikel');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    try {
      await api.delete(`/articles/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus artikel');
    }
  };

  // Category Actions
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, description: cat.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
      } else {
        await api.post('/categories', categoryForm);
      }
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan kategori');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus kategori');
    }
  };

  return (
    <main className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Dashboard Manajemen Content</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Selamat datang, <strong>{user?.name}</strong> ({user?.role?.toUpperCase()})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => handleOpenArticleModal()} className="btn btn-primary" id="btn-admin-add-article">
            <Plus size={16} /> Buat Artikel
          </button>
          {user?.role === 'admin' && (
            <button onClick={() => handleOpenCategoryModal()} className="btn btn-outline" id="btn-admin-add-category">
              <Plus size={16} /> Tambah Kategori
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)' }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{articles.length}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Artikel</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Folder size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{categories.length}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kategori Aktif</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('articles')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            color: activeTab === 'articles' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'articles' ? '2px solid var(--accent-primary)' : 'none',
            fontWeight: 700,
            fontSize: '1rem',
          }}
          id="tab-articles"
        >
          Daftar Artikel ({articles.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            color: activeTab === 'categories' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'categories' ? '2px solid var(--accent-primary)' : 'none',
            fontWeight: 700,
            fontSize: '1rem',
          }}
          id="tab-categories"
        >
          Kategori Berita ({categories.length})
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('accounts')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'transparent',
              color: activeTab === 'accounts' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'accounts' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: 700,
              fontSize: '1rem',
            }}
            id="tab-accounts"
          >
            Pengaturan Akun
          </button>
        )}
      </div>

      {/* Articles Table */}
      {activeTab === 'articles' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Judul Artikel</th>
                <th>Kategori</th>
                <th>Penulis</th>
                <th>Status</th>
                <th>Views</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art) => (
                <tr key={art.id}>
                  <td>
                    <strong>{art.title}</strong>
                    {art.is_featured && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--accent-warning)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>UTAMA</span>}
                  </td>
                  <td>{art.category?.name || '-'}</td>
                  <td>{art.author?.name || '-'}</td>
                  <td>
                    <span className="badge-category" style={{ background: art.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: art.status === 'published' ? '#10b981' : '#f59e0b', borderColor: 'transparent' }}>
                      {art.status}
                    </span>
                  </td>
                  <td>{art.views_count || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenArticleModal(art)} className="btn btn-outline btn-sm" title="Edit Artikel">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteArticle(art.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--accent-danger)' }} title="Hapus Artikel">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories Table */}
      {activeTab === 'categories' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th>Slug</th>
                <th>Deskripsi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td><strong>{cat.name}</strong></td>
                  <td><code>{cat.slug}</code></td>
                  <td>{cat.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenCategoryModal(cat)} className="btn btn-outline btn-sm" title="Edit Kategori">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--accent-danger)' }} title="Hapus Kategori">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Account Management Tab */}
      {activeTab === 'accounts' && user?.role === 'admin' && (
        <AccountManagement />
      )}

      {/* Modal Article Form */}
      {showArticleModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>
              <button onClick={() => setShowArticleModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveArticle}>
              <div className="form-group">
                <label>Judul Artikel</label>
                <input
                  type="text"
                  className="form-control"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Kategori</label>
                <select
                  className="form-control"
                  value={articleForm.category_id}
                  onChange={(e) => setArticleForm({ ...articleForm, category_id: e.target.value })}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ringkasan (Summary)</label>
                <input
                  type="text"
                  className="form-control"
                  value={articleForm.summary}
                  onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>URL Gambar Thumbnail</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={articleForm.thumbnail_url}
                  onChange={(e) => setArticleForm({ ...articleForm, thumbnail_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Konten Lengkap Berita</label>
                <textarea
                  className="form-control"
                  rows="6"
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={articleForm.is_featured}
                    onChange={(e) => setArticleForm({ ...articleForm, is_featured: e.target.checked })}
                  />
                  Jadikan Berita Utama (Featured Hero)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowArticleModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" id="btn-save-article-modal">
                  Simpan Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Category Form */}
      {showCategoryModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingCategory ? 'Edit Kategori' : 'Kategori Baru'}</h2>
              <button onClick={() => setShowCategoryModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label>Nama Kategori</label>
                <input
                  type="text"
                  className="form-control"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" id="btn-save-category-modal">
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
