import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Newspaper, Folder, Plus, Edit, Trash2, X, Eye, EyeOff, FileText, CheckCircle, Users, Flame } from 'lucide-react';
import { AccountManagement } from '../components/AccountManagement';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'categories'

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
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
    tag_ids: [],
    status: 'published',
    is_featured: false,
  });

  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({ name: '' });

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
      const [artRes, catRes, tagRes, popRes] = await Promise.all([
        api.get('/admin/articles?status=all&limit=100'),
        api.get('/categories'),
        api.get('/tags'),
        user?.role === 'admin' ? api.get('/admin/articles/popular?period=30d&limit=20') : Promise.resolve({ data: { data: [] } }),
      ]);
      setArticles(artRes.data?.data || []);
      setCategories(catRes.data || []);
      setTags(tagRes.data || []);
      setPopularArticles(popRes.data?.data || []);
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
        tag_ids: art.tags ? art.tags.map(t => t.id) : [],
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
        tag_ids: [],
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

  const handleToggleArticleStatus = async (art) => {
    const nextStatus = art.status === 'published' ? 'draft' : 'published';
    if (art.status === 'published' && !confirm('Apakah Anda yakin ingin menyembunyikan artikel ini dari publik?')) return;
    
    try {
      await api.patch(`/admin/articles/${art.id}/status`, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengubah status artikel');
    }
  };

  const handleToggleBreaking = async (art) => {
    if (user?.role !== 'admin') return;
    const isBreaking = !art.is_breaking;
    let priority = 0;
    if (isBreaking) {
      const input = prompt("Masukkan nilai prioritas Breaking News (angka lebih besar = lebih prioritas):", "10");
      if (input === null) return;
      priority = parseInt(input, 10);
      if (isNaN(priority) || priority < 0) {
        alert("Prioritas harus berupa angka positif.");
        return;
      }
    } else {
      if (!confirm('Berhentikan status Breaking News?')) return;
    }

    try {
      await api.patch(`/admin/articles/${art.id}/breaking`, { is_breaking: isBreaking, priority: priority });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengubah status breaking');
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

  // Tag Actions
  const handleOpenTagModal = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setTagForm({ name: tag.name });
    } else {
      setEditingTag(null);
      setTagForm({ name: '' });
    }
    setShowTagModal(true);
  };

  const handleSaveTag = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await api.put(`/admin/tags/${editingTag.id}`, tagForm);
      } else {
        await api.post('/admin/tags', tagForm);
      }
      setShowTagModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan tag');
    }
  };

  const handleDeleteTag = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tag ini?')) return;
    try {
      await api.delete(`/admin/tags/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus tag');
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
            <>
              <button onClick={() => handleOpenCategoryModal()} className="btn btn-outline" id="btn-admin-add-category">
                <Plus size={16} /> Tambah Kategori
              </button>
              <button onClick={() => handleOpenTagModal()} className="btn btn-outline" id="btn-admin-add-tag">
                <Plus size={16} /> Tambah Tag
              </button>
            </>
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
          <>
            <button
              onClick={() => setActiveTab('tags')}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'transparent',
                color: activeTab === 'tags' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'tags' ? '2px solid var(--accent-primary)' : 'none',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              Master Tag ({tags.length})
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'transparent',
                color: activeTab === 'popular' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'popular' ? '2px solid var(--accent-primary)' : 'none',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              Popular News
            </button>
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
          </>
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
                    {art.is_breaking && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--accent-danger)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>BREAKING ({art.breaking_priority})</span>}
                  </td>
                  <td>{art.category?.name || '-'}</td>
                  <td>{art.author?.name || '-'}</td>
                  <td>
                    <span className="badge-category" style={{ background: art.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: art.status === 'published' ? '#10b981' : '#f59e0b', borderColor: 'transparent' }}>
                      {art.status === 'published' ? 'Tayang' : 'Draft'}
                    </span>
                  </td>
                  <td>{art.views_count || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {art.status === 'published' ? (
                        <button onClick={() => handleToggleArticleStatus(art)} className="btn btn-outline btn-sm" style={{ color: '#f59e0b', borderColor: '#f59e0b' }} title="Jadikan Draft / Sembunyikan">
                          <EyeOff size={14} />
                        </button>
                      ) : (
                        <button onClick={() => handleToggleArticleStatus(art)} className="btn btn-outline btn-sm" style={{ color: '#10b981', borderColor: '#10b981' }} title="Terbitkan / Publish">
                          <Eye size={14} />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button onClick={() => handleToggleBreaking(art)} className="btn btn-outline btn-sm" style={{ color: art.is_breaking ? 'var(--accent-danger)' : 'var(--text-secondary)', borderColor: art.is_breaking ? 'var(--accent-danger)' : 'var(--border-color)' }} title="Toggle Breaking News">
                          <Flame size={14} />
                        </button>
                      )}
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

      {/* Tags Table */}
      {activeTab === 'tags' && user?.role === 'admin' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Tag</th>
                <th>Slug</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td><strong>#{tag.name}</strong></td>
                  <td><code>{tag.slug}</code></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenTagModal(tag)} className="btn btn-outline btn-sm" title="Edit Tag">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteTag(tag.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--accent-danger)' }} title="Hapus Tag">
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

      {/* Popular News Table */}
      {activeTab === 'popular' && user?.role === 'admin' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>Judul Artikel</th>
                <th>Kategori</th>
                <th>Penulis</th>
                <th>Views (30 Hari)</th>
                <th>Total Views</th>
              </tr>
            </thead>
            <tbody>
              {popularArticles.map((art, idx) => (
                <tr key={art.id}>
                  <td><strong>#{idx + 1}</strong></td>
                  <td><strong>{art.title}</strong></td>
                  <td>{art.category?.name || '-'}</td>
                  <td>{art.author?.name || '-'}</td>
                  <td><strong style={{ color: 'var(--accent-primary)' }}>{art.period_views}</strong></td>
                  <td>{art.views_count}</td>
                </tr>
              ))}
              {popularArticles.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Belum ada data popular news dalam 30 hari terakhir.</td>
                </tr>
              )}
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
                <label>Tag Berita</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  {tags.map((tag) => (
                    <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={articleForm.tag_ids.includes(tag.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setArticleForm(prev => {
                            if (checked) {
                              return { ...prev, tag_ids: [...prev.tag_ids, tag.id] };
                            } else {
                              return { ...prev, tag_ids: prev.tag_ids.filter(id => id !== tag.id) };
                            }
                          });
                        }}
                      />
                      #{tag.name}
                    </label>
                  ))}
                  {tags.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Belum ada master tag tersedia.</span>}
                </div>
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

              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  value={articleForm.status}
                  onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value })}
                  required
                >
                  <option value="published">Tayang (Published)</option>
                  <option value="draft">Draft (Belum Tayang)</option>
                </select>
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
      {/* Modal Tag Form */}
      {showTagModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingTag ? 'Edit Tag' : 'Tag Baru'}</h2>
              <button onClick={() => setShowTagModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveTag}>
              <div className="form-group">
                <label>Nama Tag</label>
                <input
                  type="text"
                  className="form-control"
                  value={tagForm.name}
                  onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowTagModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" id="btn-save-tag-modal">
                  Simpan Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
