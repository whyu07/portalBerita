import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { ArticleCard } from "../components/ArticleCard";

export default function TagPage() {
  const { slug } = useParams();
  const [tag, setTag] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/tags/${slug}/articles?page=${page}&limit=6`);
        setTag(response.data.tag);
        if (page === 1) {
          setArticles(response.data.data);
        } else {
          setArticles(prev => [...prev, ...response.data.data]);
        }
        setTotal(response.data.total);
      } catch (error) {
        console.error("Gagal mengambil berita tag:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [slug, page]);

  if (!loading && !tag) {
    return (
      <main className="main-content text-center p-4">
        <h2 className="text-2xl font-bold text-danger mb-4">Tag Tidak Ditemukan</h2>
        <p className="text-muted mt-4">Tag yang Anda cari mungkin salah atau telah dihapus.</p>
      </main>
    );
  }

  return (
    <main className="main-content">
      {tag && (
        <div className="ui-panel">
          <div className="d-flex align-center text-primary mb-2" style={{ gap: '0.75rem' }}>
            <span className="text-sm font-bold text-uppercase">TAG</span>
          </div>
          <h1 className="text-4xl mb-2">#{tag.name}</h1>
          <p className="text-muted">Menampilkan semua berita terkait topik "{tag.name}"</p>
        </div>
      )}

      {loading && page === 1 ? (
        <div className="text-center p-4 text-muted">
          Memuat artikel...
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div className="ui-panel text-center">
              <p className="text-muted">Belum ada berita untuk tag ini.</p>
            </div>
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
