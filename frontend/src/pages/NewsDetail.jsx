import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, Eye, User, MessageSquare, Send, Trash2, ArrowLeft } from 'lucide-react';
import { PopularNews } from '../components/PopularNews';

export const NewsDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articleRes, popularRes] = await Promise.all([
          api.get(`/articles/${slug}`),
          api.get('/articles?limit=5') // Assuming limited /articles to simulate popular
        ]);
        
        setArticle(articleRes.data);
        setComments(articleRes.data.comments || []);
        
        const sortedPopular = (popularRes.data?.data || [])
          .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
          .slice(0, 5);
        setPopularArticles(sortedPopular);
      } catch (err) {
        console.error('Failed to load article detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !article) return;

    setPosting(true);
    try {
      const res = await api.post(`/comments/article/${article.id}`, { content: newComment.trim() });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menambahkan komentar');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus komentar');
    }
  };

  if (loading) {
    return (
      <main className="main-content" style={{ textAlign: 'center', padding: '5rem 0' }}>
        Memuat detail artikel...
      </main>
    );
  }

  if (!article) {
    return (
      <main className="main-content" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Artikel tidak ditemukan</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Kembali ke Beranda</Link>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="two-column-layout">
        
        {/* Kolom Kiri 70%: Artikel & Komentar */}
        <article>
          <Link to="/" className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Kembali
          </Link>

          <div>
            {article.category && (
              <span className="badge-category" style={{ marginBottom: '1rem' }}>
                {article.category.name}
              </span>
            )}
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>{article.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} /> Oleh {article.author?.name || 'Redaksi'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={16} /> {article.views_count || 0} Dilihat
              </span>
            </div>
          </div>

          {article.thumbnail_url && (
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '2.5rem', maxHeight: '500px', width: '100%' }}>
              <img src={article.thumbnail_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-line', marginBottom: '4rem' }}>
            {article.content}
          </div>

          {/* Comment Section */}
          <section style={{ borderTop: '2px solid var(--border-color)', paddingTop: '2.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
              <MessageSquare style={{ color: 'var(--accent-primary)' }} /> Komentar ({comments.length})
            </h3>

            {user ? (
              <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2.5rem' }}>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Tulis pendapat atau komentar Anda..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={posting}>
                  <Send size={16} /> {posting ? 'Mengirim...' : 'Kirim Komentar'}
                </button>
              </form>
            ) : (
              <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', textAlign: 'center', border: 'var(--glass-border)' }}>
                <p>Silakan <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Masuk</Link> atau <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Daftar</Link> untuk berpartisipasi dalam diskusi.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {comments.map((c) => (
                <div key={c.id} style={{ background: 'var(--bg-secondary)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{c.user?.name || 'Pengguna'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {(user?.id === c.user_id || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          style={{ background: 'transparent', color: 'var(--accent-danger)', cursor: 'pointer' }}
                          title="Hapus Komentar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>{c.content}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

      </div>
    </main>
  );
};
