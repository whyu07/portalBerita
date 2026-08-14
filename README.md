# Portal Berita (React + Go Gin + PostgreSQL)

Aplikasi Portal Berita full-stack dengan arsitektur decoupled.

## 🛠️ Stack Teknologi
- **Backend**: Go (Gin Framework), GORM, JWT Authentication, SQLite (Fallback) / PostgreSQL
- **Frontend**: React, Vite, React Router DOM, Axios, Lucide React, Modern CSS (Dark/Light mode)
- **Container**: Docker & Docker Compose

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Menjalankan Backend (Go)
```bash
cd backend
go run cmd/main.go
```
*Server akan berjalan di `http://localhost:8080`*

#### User Default Seeder:
- **Admin**: `admin@portalberita.com` / `admin123`
- **Author**: `budi@portalberita.com` / `author123`

### 2. Menjalankan Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
*Aplikasi frontend dapat diakses di `http://localhost:5173`*

### 3. Menjalankan via Docker Compose
```bash
docker-compose up --build
```

---

## 📡 Endpoint REST API Utama

- `POST /api/v1/auth/register` - Registrasi pengguna baru
- `POST /api/v1/auth/login` - Authentikasi & pembentukan JWT token
- `GET /api/v1/auth/me` - Informasi profil pengguna terautentikasi
- `GET /api/v1/articles` - Mengambil daftar artikel (Search & Category filter)
- `GET /api/v1/articles/:slug` - Detail artikel & hit count view
- `POST /api/v1/articles` - (Admin/Author) Tambah artikel baru
- `PUT /api/v1/articles/:id` - (Admin/Author) Edit artikel
- `DELETE /api/v1/articles/:id` - (Admin/Author) Hapus artikel
- `GET /api/v1/categories` - Mengambil daftar kategori
- `POST /api/v1/comments/article/:articleId` - Tambah komentar
