import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, User, MessageSquare, Send, Trash2 } from 'lucide-react';
import { ArticleContent } from '../components/ArticleContent';
import { Breadcrumb } from '../components/Breadcrumb';
import { RelatedCard } from '../components/news/RelatedCard';
import { CategoryBadge } from '../components/news/CategoryBadge';
import { Button } from '../components/common/Button';

export const NewsDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (windowHeight === 0) return;
      
      const scroll = totalScroll / windowHeight;
      setScrollProgress(scroll * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setRelatedLoading(true);
      setError(null);
      try {
        const articleRes = await api.get(`/articles/${slug}`);
        setArticle(articleRes.data);
        setComments(articleRes.data.comments || []);
      } catch (err) {
        console.error('Failed to load article detail:', err);
        setError('Artikel tidak ditemukan.');
        setArticle(null);
      } finally {
        setLoading(false);
      }

      // Fetch related articles separately so failure doesn't break the main article
      try {
        const relatedRes = await api.get(`/articles/${slug}/related?limit=5`);
        const related = (relatedRes.data?.data || []).filter(a => a.slug !== slug);
        setRelatedArticles(related);
      } catch (err) {
        console.error('Failed to load related articles:', err);
        setRelatedArticles([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0 });
  }, [slug]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/1200x600/1e293b/ffffff?text=404+Image+Not+Found';
  };

  // SEO: Update document head
  useEffect(() => {
    if (!article) return;

    const siteURL = window.location.origin;
    const metaTitle = article.meta_title || article.title;
    const metaDesc = article.meta_description || article.summary || (article.content?.replace(/<[^>]*>/g, '').substring(0, 160));
    const canonical = article.canonical_url || `${siteURL}/article/${article.slug}`;
    const ogImage = article.og_image_url || article.thumbnail_url || '';

    document.title = metaTitle;

    const setOrCreateMeta = (attr, attrValue, content) => {
      let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setOrCreateMeta('name', 'description', metaDesc);

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonical);

    // Open Graph
    setOrCreateMeta('property', 'og:title', metaTitle);
    setOrCreateMeta('property', 'og:description', metaDesc);
    setOrCreateMeta('property', 'og:url', canonical);
    setOrCreateMeta('property', 'og:type', 'article');
    if (ogImage) setOrCreateMeta('property', 'og:image', ogImage);
    if (article.published_at) {
      setOrCreateMeta('property', 'article:published_time', article.published_at);
    }

    return () => {
      document.title = 'Portal Berita';
    };
  }, [article]);

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
      <main className="main-content">
        <div className="two-column-layout">
          <article>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <div style={{ height: '20px', width: '60px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }} className="skeleton" />
              <div style={{ height: '20px', width: '80px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }} className="skeleton" />
            </div>
            
            <div style={{ height: '40px', width: '80%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }} className="skeleton" />
            
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ height: '20px', width: '100px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }} className="skeleton" />
              <div style={{ height: '20px', width: '150px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }} className="skeleton" />
              <div style={{ height: '20px', width: '80px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }} className="skeleton" />
            </div>

            <div style={{ height: '400px', width: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem' }} className="skeleton" />

            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: '20px', width: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }} className="skeleton" />
            ))}
          </article>
          <aside>
            <div style={{ height: '300px', width: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }} className="skeleton" />
          </aside>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content text-center p-4">
        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'inline-block' }}>
          <h2 className="text-xl font-bold mb-4">{error}</h2>
          <Link to="/" className="btn btn-primary mt-4">Kembali ke Beranda</Link>
        </div>
      </main>
    );
  }

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: 'Beranda', to: '/' },
  ];
  if (article.category) {
    breadcrumbItems.push({
      label: article.category.name,
      to: `/category/${article.category.slug}`,
    });
  }
  breadcrumbItems.push({ label: article.title });

  return (
    <>
      <div className="reading-progress-container">
        <div 
          className="reading-progress-bar" 
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
      <main className="main-content">
        <div className="two-column-layout">
        
        {/* Kolom Kiri: Artikel & Komentar */}
        <article>
          <Breadcrumb items={breadcrumbItems} />

          <header className="mb-8">
            <CategoryBadge category={article.category} className="mb-4" />
            <h1 className="text-4xl font-bold mb-4" style={{ lineHeight: '1.2' }}>{article.title}</h1>
            
            <div className="d-flex align-center flex-wrap mb-8 text-muted text-sm" style={{ gap: '1.5rem' }}>
              <span className="d-flex align-center" style={{ gap: '0.5rem' }}>
                <User size={16} /> Oleh {article.author?.name || 'Redaksi'}
              </span>
              <span className="d-flex align-center" style={{ gap: '0.5rem' }}>
                <Clock size={16} /> {new Date(article.published_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </header>

          {article.thumbnail_url && (
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '2.5rem', maxHeight: '500px', width: '100%' }}>
              <img src={article.thumbnail_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={handleImageError} />
            </div>
          )}

          <ArticleContent content={article.content} />

          {/* Related News Section */}
          {!relatedLoading && relatedArticles.length > 0 && (
            <section style={{ borderTop: '2px solid var(--border-color)', paddingTop: '2.5rem', marginTop: '3rem', marginBottom: '2rem' }}>
              <h3 className="text-2xl font-bold mb-4">Berita Terkait</h3>
              <div className="d-flex flex-col" style={{ gap: '1rem' }}>
                {relatedArticles.map((ra) => (
                  <RelatedCard key={ra.id} article={ra} />
                ))}
              </div>
            </section>
          )}

          {/* Comment Section */}
          <section style={{ borderTop: '2px solid var(--border-color)', paddingTop: '2.5rem' }}>
            <h3 className="d-flex align-center text-2xl mb-4" style={{ gap: '0.5rem' }}>
              <MessageSquare className="text-primary" /> Komentar ({comments.length})
            </h3>

            {user ? (
              <div className="ui-panel">
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Tulis komentar Anda di sini..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <Button type="submit" variant="primary" loading={posting} icon={<Send size={16} />}>
                    Kirim Komentar
                  </Button>
                </form>
              </div>
            ) : (
              <div className="ui-panel text-center">
                <p className="text-muted" style={{ margin: 0 }}>Silakan login untuk memberikan komentar.</p>
              </div>
            )}

            <div className="d-flex flex-col" style={{ gap: '1.25rem' }}>
              {comments.map((c) => (
                <div key={c.id} className="ui-panel">
                  <div className="d-flex justify-between mb-4">
                    <span className="font-bold text-lg">{c.user?.name || 'Pengguna'}</span>
                    <div className="d-flex align-center" style={{ gap: '1rem' }}>
                      <span className="text-sm text-muted">
                        {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {(user?.id === c.user_id || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="btn btn-sm"
                          style={{ color: 'var(--accent-danger)', background: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-primary m-0">{c.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-muted">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
              )}
            </div>
          </section>
        </article>

        {/* Kolom Kanan: Iklan atau sidebar lain (Kosong untuk sekarang, bisa diisi nanti) */}
        <aside>
          <div className="sticky-sidebar">
            <div className="ui-panel text-center">
              <span className="text-muted text-sm uppercase">Space Iklan</span>
              <div style={{ height: '300px', background: 'var(--bg-secondary)', marginTop: '1rem', borderRadius: 'var(--radius-md)' }}></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
    </>
  );
};
