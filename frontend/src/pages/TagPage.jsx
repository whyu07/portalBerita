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
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Tag Tidak Ditemukan</h2>
        <p className="text-gray-600 mt-4">Tag yang Anda cari mungkin salah atau telah dihapus.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {tag && (
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 border-l-4 border-indigo-600 pl-4">
            #{tag.name}
          </h1>
          <p className="text-gray-600 mt-2">Menampilkan semua berita terkait topik "{tag.name}"</p>
        </div>
      )}

      {loading && page === 1 ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">Belum ada berita untuk tag ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {articles.length < total && (
            <div className="text-center mt-12">
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 disabled:opacity-50"
              >
                {loading ? "Memuat..." : "Muat Lebih Banyak"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
