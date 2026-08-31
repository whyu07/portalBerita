import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Newspaper, Folder, Plus, Edit, Trash2, X, Eye, EyeOff, FileText, CheckCircle, Users, Flame } from 'lucide-react';
import { AccountManagement } from '../components/AccountManagement';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DataTable } from '../components/dashboard/DataTable';
import { ModalForm } from '../components/dashboard/ModalForm';
import { StatusBadge } from '../components/dashboard/StatusBadge';
import { Button } from '../components/common/Button';
import { FormField } from '../components/common/FormField';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'categories'

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    og_image_url: '',
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
    setError(null);
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
      setError('Gagal memuat data dashboard. Silakan coba muat ulang halaman.');
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
        meta_title: art.meta_title || '',
        meta_description: art.meta_description || '',
        canonical_url: art.canonical_url || '',
        og_image_url: art.og_image_url || '',
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
        meta_title: '',
        meta_description: '',
        canonical_url: '',
        og_image_url: '',
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
    <>
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="dashboard-content">
        {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Dashboard Manajemen Content</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Selamat datang, <strong>{user?.name}</strong> ({user?.role?.toUpperCase()})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button onClick={() => handleOpenArticleModal()} variant="primary" id="btn-admin-add-article" icon={<Plus size={16} />}>
            Buat Artikel
          </Button>
          {user?.role === 'admin' && (
            <>
              <Button onClick={() => handleOpenCategoryModal()} variant="outline" id="btn-admin-add-category" icon={<Plus size={16} />}>
                Tambah Kategori
              </Button>
              <Button onClick={() => handleOpenTagModal()} variant="outline" id="btn-admin-add-tag" icon={<Plus size={16} />}>
                Tambah Tag
              </Button>
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


      {/* Articles Table */}
      {activeTab === 'articles' && (
        <DataTable
          loading={loading}
          error={error}
          emptyTitle="Belum ada artikel"
          emptyDescription="Anda belum membuat artikel satupun."
          emptyActionLabel="Buat Artikel Pertama"
          onEmptyAction={() => handleOpenArticleModal()}
          columns={[
            { header: 'Judul Artikel', cell: (row) => (
                <>
                  <strong>{row.title}</strong>
                  {row.is_featured && <StatusBadge type="featured" />}
                  {row.is_breaking && <StatusBadge type="breaking" priority={row.breaking_priority} />}
                </>
              )
            },
            { header: 'Kategori', accessor: 'category_name', cell: (row) => row.category?.name || '-' },
            { header: 'Penulis', accessor: 'author_name', cell: (row) => row.author?.name || '-' },
            { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
            { header: 'Views', accessor: 'views_count', cell: (row) => row.views_count || 0 },
            { header: 'Aksi', cell: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button 
                    variant="outline" size="sm" 
                    onClick={() => handleToggleArticleStatus(row)} 
                    style={{ color: row.status === 'published' ? '#f59e0b' : '#10b981', borderColor: row.status === 'published' ? '#f59e0b' : '#10b981' }} 
                    title={row.status === 'published' ? 'Jadikan Draft' : 'Terbitkan'}
                  >
                    {row.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  {user?.role === 'admin' && (
                    <Button 
                      variant="outline" size="sm" 
                      onClick={() => handleToggleBreaking(row)} 
                      style={{ color: row.is_breaking ? 'var(--accent-danger)' : 'var(--text-secondary)', borderColor: row.is_breaking ? 'var(--accent-danger)' : 'var(--border-color)' }}
                      title="Toggle Breaking News"
                    >
                      <Flame size={14} />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleOpenArticleModal(row)} title="Edit">
                    <Edit size={14} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteArticle(row.id)} style={{ color: 'var(--accent-danger)' }} title="Hapus">
                    <Trash2 size={14} />
                  </Button>
                </div>
              )
            }
          ]}
          data={articles}
        />
      )}

      {/* Categories Table */}
      {activeTab === 'categories' && (
        <DataTable
          loading={loading}
          error={error}
          columns={[
            { header: 'Nama Kategori', cell: (row) => <strong>{row.name}</strong> },
            { header: 'Slug', cell: (row) => <code>{row.slug}</code> },
            { header: 'Deskripsi', accessor: 'description', cell: (row) => row.description || '-' },
            { header: 'Aksi', cell: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm" onClick={() => handleOpenCategoryModal(row)} title="Edit">
                    <Edit size={14} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(row.id)} style={{ color: 'var(--accent-danger)' }} title="Hapus">
                    <Trash2 size={14} />
                  </Button>
                </div>
              )
            }
          ]}
          data={categories}
        />
      )}

      {/* Tags Table */}
      {activeTab === 'tags' && user?.role === 'admin' && (
        <DataTable
          loading={loading}
          error={error}
          columns={[
            { header: 'Nama Tag', cell: (row) => <strong>#{row.name}</strong> },
            { header: 'Slug', cell: (row) => <code>{row.slug}</code> },
            { header: 'Aksi', cell: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm" onClick={() => handleOpenTagModal(row)} title="Edit">
                    <Edit size={14} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTag(row.id)} style={{ color: 'var(--accent-danger)' }} title="Hapus">
                    <Trash2 size={14} />
                  </Button>
                </div>
              )
            }
          ]}
          data={tags}
        />
      )}

      {/* Popular News Table */}
      {activeTab === 'popular' && user?.role === 'admin' && (
        <DataTable
          loading={loading}
          error={error}
          columns={[
            { header: 'Peringkat', cell: (row, idx) => <strong>#{popularArticles.indexOf(row) + 1}</strong> },
            { header: 'Judul Artikel', cell: (row) => <strong>{row.title}</strong> },
            { header: 'Kategori', cell: (row) => row.category?.name || '-' },
            { header: 'Penulis', cell: (row) => row.author?.name || '-' },
            { header: 'Views (30 Hari)', cell: (row) => <strong style={{ color: 'var(--accent-primary)' }}>{row.period_views}</strong> },
            { header: 'Total Views', cell: (row) => row.views_count }
          ]}
          data={popularArticles}
        />
      )}

      {/* Account Management Tab */}
      {activeTab === 'accounts' && user?.role === 'admin' && (
        <AccountManagement />
      )}

      {/* Modal Article Form */}
      <ModalForm
        isOpen={showArticleModal}
        onClose={() => setShowArticleModal(false)}
        onSubmit={handleSaveArticle}
        title={editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}
        submitLabel="Simpan Artikel"
        maxWidth="800px"
      >
        <FormField
          label="Judul Artikel"
          id="article-title"
          value={articleForm.title}
          onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
          required
        />

        <FormField
          label="Kategori"
          id="article-category"
          as="select"
          value={articleForm.category_id}
          onChange={(e) => setArticleForm({ ...articleForm, category_id: e.target.value })}
          required
        >
          <option value="">Pilih Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </FormField>

        <div className="form-group">
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tag Berita</label>
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

        <FormField
          label="Ringkasan (Summary)"
          id="article-summary"
          value={articleForm.summary}
          onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
        />

        <FormField
          label="URL Gambar Thumbnail"
          id="article-thumbnail"
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={articleForm.thumbnail_url}
          onChange={(e) => setArticleForm({ ...articleForm, thumbnail_url: e.target.value })}
        />

        <div className="form-group">
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Konten Lengkap Berita</label>
          <ReactQuill
            theme="snow"
            value={articleForm.content}
            onChange={(value) => setArticleForm({ ...articleForm, content: value })}
            modules={{
              toolbar: [
                [{ 'header': [2, 3, 4, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['blockquote', 'link', 'image', 'video'],
                ['clean']
              ]
            }}
            style={{ minHeight: '200px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        <FormField
          label="Status"
          id="article-status"
          as="select"
          value={articleForm.status}
          onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value })}
          required
        >
          <option value="published">Tayang (Published)</option>
          <option value="draft">Draft (Belum Tayang)</option>
        </FormField>

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

        {/* SEO Metadata Fields */}
        <details style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--glass-border)' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Metadata SEO (Opsional)</summary>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField
              label={`Meta Title (${articleForm.meta_title.length}/60)`}
              id="meta-title"
              maxLength={60}
              placeholder="Judul untuk mesin pencari"
              value={articleForm.meta_title}
              onChange={(e) => setArticleForm({ ...articleForm, meta_title: e.target.value })}
              className="m-0"
            />
            <FormField
              label={`Meta Description (${articleForm.meta_description.length}/160)`}
              id="meta-description"
              as="textarea"
              rows="2"
              maxLength={160}
              placeholder="Deskripsi singkat untuk mesin pencari"
              value={articleForm.meta_description}
              onChange={(e) => setArticleForm({ ...articleForm, meta_description: e.target.value })}
              className="m-0"
            />
            <FormField
              label="Canonical URL"
              id="canonical-url"
              type="url"
              placeholder="https://contoh.com/article/judul-artikel"
              value={articleForm.canonical_url}
              onChange={(e) => setArticleForm({ ...articleForm, canonical_url: e.target.value })}
              className="m-0"
            />
            <FormField
              label="OG Image URL"
              id="og-image-url"
              type="url"
              placeholder="https://contoh.com/images/og.jpg"
              value={articleForm.og_image_url}
              onChange={(e) => setArticleForm({ ...articleForm, og_image_url: e.target.value })}
              className="m-0"
            />
          </div>
        </details>
      </ModalForm>

      {/* Modal Category Form */}
      <ModalForm
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={handleSaveCategory}
        title={editingCategory ? 'Edit Kategori' : 'Kategori Baru'}
        submitLabel="Simpan Kategori"
        maxWidth="450px"
      >
        <FormField
          label="Nama Kategori"
          id="category-name"
          value={categoryForm.name}
          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
          required
        />
        <FormField
          label="Deskripsi"
          id="category-description"
          as="textarea"
          rows="3"
          value={categoryForm.description}
          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
        />
      </ModalForm>
      {/* Modal Tag Form */}
      <ModalForm
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        onSubmit={handleSaveTag}
        title={editingTag ? 'Edit Tag' : 'Tag Baru'}
        submitLabel="Simpan Tag"
        maxWidth="450px"
      >
        <FormField
          label="Nama Tag"
          id="tag-name"
          value={tagForm.name}
          onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
          required
        />
      </ModalForm>

      </main>
    </>
  );
};
