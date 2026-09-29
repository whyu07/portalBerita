# Deployment Portal Berita

Panduan ini menjalankan aplikasi dalam mode production menggunakan Docker Compose:

- PostgreSQL sebagai database production;
- backend Go sebagai service internal;
- frontend React yang dibuild menjadi static files dan disajikan oleh Nginx;
- Nginx host sebagai reverse proxy dan terminator HTTPS.

## 1. Prasyarat

Siapkan server Linux dengan:

- Docker Engine;
- Docker Compose Plugin (`docker compose`);
- domain yang DNS-nya mengarah ke IP server;
- Nginx host jika ingin memakai HTTPS pada domain.

Jangan menyalin `backend/portal_berita.db` ke server production. File tersebut hanya untuk development dan tidak dipakai oleh Compose production.

## 2. Siapkan secret

Dari root project, salin `deploy/.env.production.example` menjadi `.env`, lalu ganti seluruh nilai contoh:

```sh
cp deploy/.env.production.example .env
```

Minimal ubah `POSTGRES_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`, domain, dan tiga nilai `BOOTSTRAP_ADMIN_*`. Password admin minimal 12 karakter; `JWT_SECRET` minimal 32 karakter.

File `.env` berisi secret dan sudah diabaikan Git. Jangan memasukkan secret ke source code, image Docker, atau repository.

## 3. Validasi dan jalankan service

Jalankan dari root project:

```sh
docker compose config
docker compose build
docker compose up -d
docker compose ps
```

Tunggu sampai `postgres` dan `backend` berstatus healthy. Periksa log jika diperlukan:

```sh
docker compose logs -f backend
docker compose logs -f frontend
```

Health check backend dapat diuji melalui frontend container atau langsung melalui endpoint publik setelah reverse proxy aktif:

```sh
curl http://127.0.0.1:5173/health
```

Respons yang diharapkan adalah JSON dengan `status` bernilai `ok`. Port PostgreSQL tidak dipublish ke host, dan port backend juga hanya tersedia di network Docker.

## 4. Admin pertama

Pada startup pertama, backend membuat admin dari `BOOTSTRAP_ADMIN_*` jika email tersebut belum ada. Proses ini aman dijalankan ulang karena tidak membuat duplikat.

Setelah berhasil login, hapus tiga variable bootstrap dari `.env`:

```text
BOOTSTRAP_ADMIN_NAME
BOOTSTRAP_ADMIN_EMAIL
BOOTSTRAP_ADMIN_PASSWORD
```

Kemudian terapkan ulang backend:

```sh
docker compose up -d --force-recreate backend
```

Pembuatan akun publik, bila tersedia di aplikasi, hanya menghasilkan role author. Jangan menggunakan akun demo dari seed development di production.

## 5. Nginx dan HTTPS

Salin `deploy/nginx/portal-berita.conf.example` ke konfigurasi Nginx host, ganti `news.example.com` dengan domain sebenarnya, lalu arahkan konfigurasi tersebut ke `127.0.0.1:5173`.

Setelah domain dapat dibuka melalui HTTP, aktifkan HTTPS menggunakan Certbot atau certificate manager pilihan. Sesuaikan `CORS_ORIGINS` dengan origin HTTPS yang sebenarnya, misalnya `https://news.example.com`.

Nginx di dalam container frontend sudah menangani dua hal penting:

- `/api/*` diteruskan ke backend;
- route React seperti `/indeks` tetap bekerja saat halaman direfresh.

## 6. Backup database

Beri permission executable satu kali, lalu jalankan backup:

```sh
chmod +x deploy/scripts/backup-postgres.sh
deploy/scripts/backup-postgres.sh
```

Hasil backup berada di `deploy/backups/`, yang diabaikan Git. Atur jadwal cron atau systemd timer dan salin backup ke storage terpisah. Backup di server yang sama bukan pengganti backup off-site.

## 7. Update aplikasi

Setelah perubahan sudah masuk ke server:

```sh
docker compose build
docker compose up -d
docker compose ps
```

Sebelum update penting, buat backup database. Perubahan schema dijalankan melalui GORM AutoMigrate saat backend startup; untuk perubahan besar, tetap lakukan review dan uji pada salinan database terlebih dahulu.

## 8. Checklist keamanan sebelum go-live

- [ ] `.env` production berisi secret kuat dan tidak masuk Git.
- [ ] `APP_ENV=production` digunakan oleh backend.
- [ ] PostgreSQL menggunakan volume dan tidak membuka port `5432` ke publik.
- [ ] Backend tidak membuka port `8080` ke publik.
- [ ] HTTPS aktif dan `CORS_ORIGINS` hanya berisi domain yang dipercaya.
- [ ] `SEED_DEMO_DATA=false` dan akun demo tidak digunakan.
- [ ] Variable `BOOTSTRAP_ADMIN_*` dihapus setelah admin pertama dibuat.
- [ ] Backup database berjalan dan dapat dibaca.
- [ ] Halaman `/`, `/indeks`, login, dashboard, dan endpoint `/health` sudah diuji.
