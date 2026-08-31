import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { ArticleCard } from "../components/news/ArticleCard";
import { EmptyState } from "../components/common/EmptyState";
import { CardSkeleton } from "../components/common/Skeleton";

export default function TagPage() {
  const { slug } = useParams();
  const [tag, setTag] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/tags/${slug}/articles?page=${page}&limit=6`);
        setTag(response.data.tag);
        if (page === 1) {
          setArticles(response.data.data);
        } else {
          setArticles(prev => [...prev, ...response.data.data]);
        }
        setTotal(response.data.total);
      } catch (err) {
        console.error("Gagal mengambil berita tag:", err);
        setError("Gagal memuat berita untuk tag ini.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [slug, page]);

  if (!loading && !tag && !error) {
    return (
      <main className="main-content text-center p-4">
        <h2 className="text-2xl font-bold text-danger mb-4">Tag Tidak Ditemukan</h2>
        <p className="text-muted mt-4">Tag yang Anda cari mungkin salah atau telah dihapus.</p>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="ui-panel">
        <div className="d-flex align-center text-primary mb-2" style={{ gap: '0.75rem' }}>
          <span className="text-sm font-bold text-uppercase">TAG</span>
        </div>
        {loading && !tag ? (
          <div style={{ height: '40px', width: '200px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }} className="skeleton" />
        ) : (
          <>
            <h1 className="text-4xl mb-2">#{tag?.name || slug}</h1>
            <p className="text-muted">Menampilkan semua berita terkait topik "{tag?.name || slug}"</p>
          </>
        )}
      </div>

      {error ? (
        <div className="text-center p-4 text-danger" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-lg)' }}>
          {error}
        </div>
      ) : loading && page === 1 ? (
        <div className="news-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <EmptyState title="Belum ada berita" description={`Tidak ada berita yang memakai tag "${tag?.name || slug}".`} />
          ) : (
            <div className="news-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {articles.length < total && (
            <div className="text-center mt-4">
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Memuat..." : "Muat Lebih Banyak"}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
