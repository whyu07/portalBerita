# Portal Berita

Aplikasi Portal Berita full-stack dengan arsitektur decoupled: **React** (frontend) dan **Go Gin** (backend).

## Stack Teknologi

- **Backend**: Go (Gin Framework), GORM, JWT Authentication, SQLite (fallback) / PostgreSQL
- **Frontend**: React, Vite, React Router DOM, Axios, Lucide React, Modern CSS (Dark/Light mode)
- **Container**: Docker & Docker Compose

---

## Cara Menjalankan Aplikasi

### Backend (Go)

```bash
cd backend
go run cmd/main.go
```

Server berjalan di `http://localhost:8080`.

#### Inisialisasi Data (Seeder)

Data awal (termasuk admin dan contoh artikel) hanya akan dibuat secara otomatis jika konfigurasi berikut terpenuhi:
- `APP_ENV=development`
- `SEED_DEMO_DATA=true`

> **Peringatan**: Di production (`APP_ENV=production`), seed data akan diabaikan demi keamanan. Anda perlu membuat user admin pertama secara manual (misalnya via query SQL ke database) jika menggunakan database kosong.

### Frontend (React — Development)

```bash
cd frontend
npm install
npm run dev
```

Aplikasi frontend dapat diakses di `http://localhost:5173`.

### Docker Compose

```bash
docker compose up --build
```

| Service | URL | Keterangan |
|---|---|---|
| Frontend | http://localhost:5173 | Nginx container (port internal 80 dipetakan ke host 5173) |
| Backend | http://localhost:8080 | Go Gin |
| PostgreSQL | localhost:5432 | Database production |

> **Catatan**: Frontend Docker memakai Nginx sebagai web server production. Port container internal adalah 80, dipetakan ke port host 5173 melalui `docker-compose.yml`. Jangan ubah `EXPOSE 80` di `frontend/Dockerfile` menjadi 5173.

---

## Route Frontend

| Route | Fungsi | Akses |
|---|---|---|
| `/` | Beranda berita | Publik |
| `/article/:slug` | Detail artikel (hanya `published`) | Publik |
| `/category/:slug` | Artikel berdasarkan kategori | Publik |
| `/medialog` | Halaman login | Publik |
| `/register` | Registrasi author | Publik |
| `/ruasdash` | Dashboard artikel, kategori, dan akun | Admin & Author |

---

## Role dan Autentikasi

| Role | Hak Akses |
|---|---|
| **admin** | Mengelola artikel, kategori, status artikel (publish/draft), dan akun admin/author |
| **author** | Mengelola artikel dan status artikel sesuai route dashboard |
| **user** | Membaca artikel dan berkomentar |

- Endpoint terlindungi memakai header `Authorization: Bearer <token>`.
- Token JWT memiliki expiry default **24 jam** (dapat dikonfigurasi).
- Token expired mengharuskan login ulang.

### Keterbatasan Expiry JWT

- Expiry JWT tidak langsung mencabut token ketika role user berubah.
- Token lama dapat membawa role lama sampai token kedaluwarsa.
- Perubahan password atau role meminta login ulang.
- Pencabutan token instan membutuhkan TokenVersion atau strategi refresh token terpisah (di luar cakupan saat ini).

---

## Status Artikel

| Status | Keterangan |
|---|---|
| `published` | Artikel tampil di website publik (beranda, kategori, pencarian, detail) |
| `draft` | Artikel **tidak** tampil di website publik, tetapi masih terlihat di dashboard |

Perubahan status dilakukan melalui tombol toggle di dashboard atau endpoint `PATCH /api/v1/admin/articles/:id/status`.

---

## Environment Variables

| Variable | Fungsi | Default / Contoh |
|---|---|---|
| `APP_ENV` | Mode aplikasi (`development` / `production`) | `development` |
| `PORT` | Port backend | `8080` |
| `JWT_SECRET` | Secret penandatangan JWT | Wajib di-set pada production |
| `JWT_EXPIRES_HOURS` | Masa berlaku JWT dalam jam | `24` |
| `SEED_DEMO_DATA` | Flag pembuat sample data (hanya dev) | `true` |
| `DB_DRIVER` | Driver database | `sqlite` (dev) / `postgres` (prod) |
| `DB_HOST` | Host PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_USER` | User PostgreSQL | `postgres` |
| `DB_PASSWORD` | Password PostgreSQL | `postgres` |
| `DB_NAME` | Nama database | `portal_berita` |
| `DB_SSLMODE` | Mode SSL PostgreSQL | `disable` |

> **Peringatan**: Jangan menyimpan secret production di repository. Pada production, `DB_DRIVER` wajib `postgres`, seluruh info koneksi DB wajib diisi, dan `JWT_SECRET` wajib memiliki panjang minimal 32 karakter.

---

## Endpoint REST API

### Auth

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Publik | Registrasi pengguna baru |
| POST | `/api/v1/auth/login` | Publik | Login & mendapatkan JWT token |
| GET | `/api/v1/auth/me` | Terautentikasi | Profil pengguna saat ini |

### Artikel Publik

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/api/v1/articles` | Publik | Daftar artikel published (search, category, featured, pagination) |
| GET | `/api/v1/articles/:slug` | Publik | Detail artikel published & increment view count |

### Dashboard Artikel

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/api/v1/admin/articles` | Admin, Author | Daftar semua artikel (published & draft) |
| PATCH | `/api/v1/admin/articles/:id/status` | Admin, Author | Ubah status artikel (publish/draft) |

### CRUD Artikel

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| POST | `/api/v1/articles` | Admin, Author | Tambah artikel baru |
| PUT | `/api/v1/articles/:id` | Admin, Author | Edit artikel |
| DELETE | `/api/v1/articles/:id` | Admin, Author | Hapus artikel |

### Kategori

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/api/v1/categories` | Publik | Daftar kategori |
| POST | `/api/v1/categories` | Admin | Tambah kategori |
| PUT | `/api/v1/categories/:id` | Admin | Edit kategori |
| DELETE | `/api/v1/categories/:id` | Admin | Hapus kategori |

### Pengaturan Akun

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/api/v1/admin/users` | Admin | Daftar user admin/author |
| POST | `/api/v1/admin/users` | Admin | Tambah user admin/author |
| PUT | `/api/v1/admin/users/:id` | Admin | Edit user |
| DELETE | `/api/v1/admin/users/:id` | Admin | Hapus user author |

### Komentar

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| GET | `/api/v1/comments/article/:articleId` | Publik | Komentar pada artikel |
| POST | `/api/v1/comments/article/:articleId` | Terautentikasi | Tambah komentar |
| DELETE | `/api/v1/comments/:id` | Terautentikasi | Hapus komentar |

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Frontend Docker tidak terbuka | Periksa mapping port `5173:80` di `docker-compose.yml` |
| API tidak dapat diakses | Pastikan backend berjalan pada port 8080 |
| Selalu diarahkan ke login | Hapus token lama dari localStorage dan login ulang |
| Token expired | Login kembali |
| PostgreSQL tidak tersedia | Backend memakai SQLite fallback sesuai konfigurasi |
| Perubahan environment tidak terbaca | Jalankan ulang `docker compose up --build` |
