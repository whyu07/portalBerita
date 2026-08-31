# Dokumentasi Struktur Frontend

Dokumen ini memuat panduan struktur direktori, penggunaan *design tokens*, dan daftar komponen *reusable* yang tersedia di proyek Portal Berita.

## Struktur Direktori Utama

- `components/common/`: Berisi komponen-komponen UI dasar yang dapat dipakai berulang tanpa logika bisnis (*Button, FormField, ModalForm, Skeleton* dll).
- `components/news/`: Komponen yang secara spesifik menampilkan entitas berita (*ArticleCard, HeroCard, RelatedCard* dll).
- `components/dashboard/`: Komponen khusus untuk area manajemen (*DataTable, FilterBar, StatusBadge*).
- `styles/`: Kumpulan pengaturan CSS global. File `index.css` bertindak sebagai *Single Source of Truth* untuk tema dan desain tokens.

## Design Tokens

Nilai desain (warna, ukuran, bayangan) diatur dalam `index.css`. Theme utama adalah *Vibrant Dark Mode*.
- **Backgrounds**: `--bg-primary`, `--bg-secondary`, `--bg-card`
- **Text**: `--text-primary`, `--text-secondary`, `--text-muted`
- **Accents**: `--accent-primary`, `--accent-hover`, `--accent-danger`, `--accent-success`
- **Border**: `--border-color`
- **Typography**: `--font-heading` (Outfit), `--font-body` (Plus Jakarta Sans)

## Daftar Komponen Utama

### 1. `DataTable` (`components/dashboard/DataTable.jsx`)
Menampilkan daftar data berwujud tabel secara responsif.
- **Props**: 
  - `columns` (array of objects: `{ header, accessor, cell }`)
  - `data` (array of data objects)
  - `loading` (boolean)
  - `error` (string | null)
  - `emptyTitle`, `emptyDescription` (string)
- **Aturan**: Tidak boleh memuat _request API_ mandiri; hanya bertindak sebagai komponen presentasional murni.

### 2. `ModalForm` (`components/dashboard/ModalForm.jsx`)
*Wrapper* standar untuk modal formulir tambah/edit data di dashboard.
- **Props**:
  - `isOpen` (boolean)
  - `onClose` (function)
  - `title`, `submitLabel` (string)
  - `onSubmit` (function event handler)
  - `submitting` (boolean - untuk status _loading_ pada tombol _submit_)
  - `error` (string | null - menampilkan kotak error di atas form)
- **Aturan**: State modal dan pemanggilan validasi/mutasi API dipegang oleh _parent_ komponen.

### 3. `FormField` (`components/common/FormField.jsx`)
Komponen input serbaguna dengan manajemen `label`, `placeholder`, `type`, dan _error hint_.
- **Props**:
  - `label` (string)
  - `type` (text, email, password, select, textarea)
  - `value`, `onChange`, `options` (jika select), `required`, `disabled`
- **Variant**: Otomatis beradaptasi dengan tipe `textarea` atau `select` apabila di-set `type`-nya.

### 4. `ArticleCard` (`components/news/ArticleCard.jsx`)
Menampilkan pratinjau berita dengan judul, *thumbnail*, tanggal, dan kategori.
- **Props**:
  - `article` (object - wajib berisi _id, slug, title, category, created_at_)
- **Aturan**: Jangan ubah komponen ini secara drastis tanpa mengecek halaman `Home`, `Index`, `Kategori`, dan `Tag` yang juga bergantung padanya.

### 5. `EmptyState` (`components/common/EmptyState.jsx`)
Blok tampilan saat data tidak ditemukan (mis. hasil filter kosong).
- **Props**:
  - `title` (string)
  - `description` (string)
  - `actionLabel`, `onAction` (opsional untuk menyertakan tombol aksi baru)

### 6. `Skeleton` & `CardSkeleton` (`components/common/Skeleton.jsx`)
Kondisi _loading_ awal (sebelum `error` atau `empty`).
- **Penggunaan**: Gunakan `<CardSkeleton />` khusus untuk daftar grid artikel.

---
**Catatan Tambahan:**
Saat membuat fitur baru, **pastikan tidak menduplikasi *styling***. Gunakan variabel desain dari `index.css` dan periksa terlebih dahulu apakah komponen yang dibutuhkan telah tersedia di folder `common/` atau `dashboard/`. Jangan memindahkan logika _fetch_ API, JWT, atau _role based access_ ke dalam komponen UI murni.
