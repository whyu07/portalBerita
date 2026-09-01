# Planning: Refactor 4 Berita Utama pada Landing Page

## Status

- [ ] Planning saja — jangan mengubah kode sebelum planning ini disetujui.
- [ ] Scope hanya frontend.
- [ ] Backend, endpoint API, autentikasi, role, dashboard, dan database tidak diubah.

## Tujuan

Ganti isi dan tampilan bagian dengan class `hero-grid` pada landing page agar menampilkan **4 berita utama terbaru berdasarkan urutan publikasi**. Layout harus mengikuti gambar referensi Figma:

1. Berita pertama menjadi kartu utama berukuran besar dengan gambar, judul, kategori, penulis, dan tanggal publikasi di atas overlay gambar.
2. Berita kedua menjadi kartu pendamping di sisi kanan bagian atas.
3. Berita ketiga dan keempat menjadi kartu pendamping di sisi kanan bagian bawah.
4. Setiap kartu dapat diklik dan membuka halaman artikel terkait.
5. Kartu tidak boleh menampilkan berita yang sama dua kali.

## Hasil yang diharapkan

- Landing page mengambil berita published dari endpoint publik yang sudah ada.
- Empat item pertama dari hasil endpoint dipakai sebagai `heroArticles`.
- Urutan terbaru mengikuti `published_at DESC`, kemudian fallback `created_at` jika tanggal publikasi tidak tersedia.
- Berita pada hero tidak ikut ditampilkan ulang pada bagian `Berita Terbaru`.
- Isi kartu menggunakan data API yang tersedia, bukan teks atau gambar hardcode.
- Tidak ada perubahan pada kontrak API.

## Komponen yang harus dibaca sebelum implementasi

Junior programmer/AI wajib membaca komponen berikut dan mencatat fungsi yang dapat digunakan kembali sebelum melakukan refactor:

- `frontend/src/pages/Home.jsx`
  - Sumber pengambilan data berita.
  - Cara menentukan urutan berita.
  - Pembagian data untuk hero dan `LatestNews`.
- `frontend/src/components/HeroNews.jsx`
  - Orchestrator saat ini untuk area `hero-grid`.
  - Prop yang saat ini diterima dan bagian yang perlu diganti.
- `frontend/src/components/news/HeroCard.jsx`
  - Kartu hero besar saat ini.
  - Logika link artikel, fallback gambar, kategori, judul, dan metadata.
- `frontend/src/components/news/CategoryBadge.jsx`
  - Badge kategori dan perilaku link ke halaman kanal.
- `frontend/src/components/LatestNews.jsx`
  - Pastikan data hero tidak ikut masuk ke daftar berita terbaru.
  - Jangan mengubah pola desain `Berita Terbaru` yang sudah disetujui kecuali diperlukan untuk mencegah duplikasi.
- `frontend/src/index.css`
  - Style `.hero-grid`, `.hero-main`, `.hero-overlay`, dan style responsive yang sudah ada.
  - Pastikan style baru tidak merusak dashboard atau halaman artikel.
- `frontend/src/pages/NewsDetail.jsx`
  - Pastikan format URL kartu tetap `/article/:slug`.

## Rencana implementasi

### 1. Audit data dan aturan pemilihan berita

- [ ] Pastikan endpoint `GET /articles` hanya mengembalikan artikel published untuk akses publik.
- [ ] Pastikan response memiliki field `id`, `slug`, `title`, `summary`, `thumbnail_url`, `category`, `author`, `created_at`, dan `published_at`.
- [ ] Pastikan backend saat ini sudah mengurutkan berdasarkan `published_at DESC, created_at DESC, id DESC`.
- [ ] Jangan menggunakan `is_featured` sebagai satu-satunya syarat berita utama karena kebutuhan ini berdasarkan berita terbaru terbit.
- [ ] Jika request landing memakai `limit=20`, pastikan jumlah tersebut cukup untuk 4 hero dan 14 `Berita Terbaru`.
- [ ] Jika data kurang dari 4 artikel, tampilkan hanya data yang tersedia tanpa membuat data dummy.

### 2. Pisahkan data hero di `Home.jsx`

- [ ] Buat variabel `heroArticles` dari maksimal 4 artikel teratas.
- [ ] Buat daftar `heroArticleIds` untuk mencegah duplikasi.
- [ ] Buat `latestNewsArticles` dari artikel setelah 4 artikel hero atau filter berdasarkan `heroArticleIds`.
- [ ] Kirim data ke `HeroNews` menggunakan satu prop yang jelas, misalnya:

  ```jsx
  <HeroNews articles={heroArticles} />
  ```

- [ ] Jangan mengubah alur pencarian, loading, error state, dan endpoint yang sudah berjalan.
- [ ] Pastikan landing page tidak error ketika response kosong, hanya berisi 1–3 artikel, atau salah satu gambar gagal dimuat.

### 3. Refactor `HeroNews.jsx`

- [ ] Ubah `HeroNews` agar menerima array maksimal 4 artikel.
- [ ] Hapus ketergantungan pada pembagian `featured` dan `latest` lama jika sudah tidak diperlukan.
- [ ] Render kartu berdasarkan posisi array:
  - index 0: `lead`/kartu utama.
  - index 1: `top-side`/kartu pendamping atas.
  - index 2–3: `bottom-side`/kartu pendamping bawah.
- [ ] Gunakan `article.id` sebagai React key.
- [ ] Jangan menambahkan API call baru di dalam `HeroNews`; semua data disiapkan oleh `Home.jsx`.
- [ ] Gunakan elemen semantik seperti `section`, `article`, dan heading yang memiliki struktur aksesibel.

### 4. Refactor atau pecah `HeroCard.jsx`

- [ ] Pertahankan satu sumber logika untuk link artikel, fallback gambar, judul, kategori, penulis, dan tanggal.
- [ ] Pilih salah satu pendekatan berikut dan gunakan secara konsisten:
  - Tambahkan prop `variant` pada `HeroCard` (`lead`, `side-image`, `side-text`); atau
  - Pecah menjadi komponen kecil seperti `HeroLeadCard` dan `HeroSideCard` dengan komponen metadata bersama.
- [ ] Kartu utama memakai gambar besar dengan overlay gelap agar judul terbaca.
- [ ] Kartu pendamping mengikuti struktur visual Figma: sebagian memakai gambar dan sebagian memakai judul/summary dengan ukuran lebih kecil.
- [ ] Tampilkan kategori secara aman. Jika kategori tidak tersedia, kartu tetap dapat dirender.
- [ ] Tampilkan tanggal dari `published_at`; fallback ke `created_at` hanya jika `published_at` kosong.
- [ ] Seluruh area setiap kartu harus menjadi link ke `/article/${article.slug}`.
- [ ] Tambahkan `aria-label` yang menjelaskan artikel yang akan dibuka.

### 5. Terapkan layout Figma pada `.hero-grid`

- [ ] Buat layout desktop dua area:
  - kolom kiri untuk kartu utama yang lebih besar;
  - kolom kanan untuk kartu kedua, ketiga, dan keempat.
- [ ] Gunakan CSS Grid dengan `grid-template-areas` atau struktur grid yang mudah dibaca junior.
- [ ] Sesuaikan ukuran gambar, jarak, border, warna overlay, tipografi serif, dan garis pemisah berdasarkan gambar referensi.
- [ ] Hindari style inline baru. Tambahkan class khusus hero jika style belum tersedia.
- [ ] Jangan memakai selector global yang memengaruhi `.card-news`, dashboard, atau halaman artikel.
- [ ] Atur `object-fit: cover`, tinggi minimum, dan `overflow: hidden` agar gambar tidak merusak layout.
- [ ] Tambahkan state hover dan focus yang terlihat.

### 6. Responsive mobile dan tablet

- [ ] Desktop: kartu utama lebih dominan, kartu pendamping berada di sisi kanan.
- [ ] Tablet: ubah proporsi kolom tanpa membuat judul terpotong secara tidak wajar.
- [ ] Mobile: tampilkan kartu dalam satu kolom dengan urutan berita 1, 2, 3, 4.
- [ ] Pastikan tidak ada horizontal overflow.
- [ ] Pastikan gambar, judul, metadata, dan link tetap mudah dibaca serta mudah disentuh.
- [ ] Sesuaikan skeleton loading agar menyerupai bentuk 4 kartu hero.

### 7. Integrasi dengan `Berita Terbaru`

- [ ] Pastikan berita nomor 1–4 pada hero tidak muncul lagi di `LatestNews`.
- [ ] Tetap tampilkan berita berikutnya sesuai batas jumlah yang sudah ditentukan pada landing page.
- [ ] Jika hanya ada 4 atau kurang artikel, `Berita Terbaru` boleh kosong dan tidak boleh menampilkan duplikasi.
- [ ] Tombol `Lihat Semua` tetap mengarah ke `/indeks`.

## Acceptance criteria

- [ ] Dengan minimal 8 artikel published, landing page menampilkan tepat 4 kartu pada hero.
- [ ] Keempat kartu memiliki data yang berbeda dan urutannya mengikuti berita terbaru terbit.
- [ ] Draft atau artikel tidak published tidak tampil di hero.
- [ ] Klik area mana pun pada kartu membuka detail artikel yang benar.
- [ ] Judul, gambar, kategori, penulis, summary, dan tanggal mengikuti data API.
- [ ] Tidak ada artikel hero yang duplikat pada `Berita Terbaru`.
- [ ] Kondisi loading, error, data kosong, gambar gagal, dan jumlah artikel kurang dari 4 ditangani.
- [ ] Tampilan desktop, tablet, dan mobile tidak rusak.
- [ ] Dashboard, login, halaman artikel, `/indeks`, endpoint, dan autentikasi tetap berjalan.
- [ ] Tidak ada perubahan file backend.

## Checklist pengujian manual

- [ ] Buka `/` tanpa query pencarian.
- [ ] Verifikasi 4 berita terbaru dan urutannya.
- [ ] Verifikasi isi kartu dengan membandingkan data response API.
- [ ] Klik gambar, judul, dan area kosong setiap kartu.
- [ ] Uji artikel tanpa thumbnail dan artikel tanpa summary.
- [ ] Uji response dengan 0, 1, 2, 3, dan 4+ artikel.
- [ ] Uji viewport desktop, tablet, dan mobile.
- [ ] Uji `/` dengan query `?search=...` untuk memastikan mode pencarian tidak rusak.
- [ ] Buka `/indeks` untuk memastikan halaman indeks tidak berubah perilakunya.
- [ ] Jalankan `npm run build` dari folder `frontend`.
- [ ] Periksa console browser dan pastikan tidak ada error React atau broken link.

## File yang kemungkinan berubah saat implementasi

- `frontend/src/pages/Home.jsx`
- `frontend/src/components/HeroNews.jsx`
- `frontend/src/components/news/HeroCard.jsx` atau komponen hero baru
- `frontend/src/index.css`

File di luar daftar tersebut hanya boleh diubah jika ada alasan teknis yang dicatat pada pull request.
