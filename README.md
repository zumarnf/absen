<div align="center">

# 🚚 Absensi Logistik

**A full-stack shift-attendance & scheduling system for logistics teams.**
**Sistem absensi shift & penjadwalan full-stack untuk tim logistik.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)
![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)
![Tests](https://img.shields.io/badge/integration%20tests-18%20passing-success)

**🌐 [English](#-english) · [Bahasa Indonesia](#-bahasa-indonesia)**

</div>

---

## 🇬🇧 English

Workers check in to their assigned shifts, request shift coverage from teammates, and submit
their course timetables; admins manage schedules, monitor attendance in real time, and export
reports.

### ✨ Features

| Domain | What it does |
| --- | --- |
| 🔐 **Authentication** | JWT in an `httpOnly` cookie, bcrypt password hashing, admin-only account creation |
| 🕒 **Attendance** | Check in to shifts (5 shifts × 2 posts), personal history, monthly summary (15th→14th period) |
| 📅 **Scheduling** | Admin assigns weekly shifts with capacity rules (max 3 workers per shift/post) |
| 🔁 **Shift Coverage** | Request a teammate to cover a shift → approve / reject / cancel flow |
| 🎓 **Course Schedule** | Workers submit their college timetable so it never clashes with shifts |
| 📡 **Realtime** | Server-Sent Events stream live attendance/schedule updates to admin dashboards |
| 📄 **PDF Export** | Generate attendance reports on demand (lazy-loaded jsPDF) |
| ⏰ **Automation** | Scheduled cron job for periodic attendance reset |

Two roles: **`admin`** (manage users, schedules, reports) and **`user`** (check in, view own data,
request coverage).

### 🧰 Tech Stack

**Frontend** — Next.js 16 (App Router + Turbopack) · React 19 · TypeScript · TanStack Query v5 ·
Zustand · Tailwind CSS v4 · shadcn/ui (Radix) · React Hook Form + Zod · nuqs · lucide-react ·
date-fns

**Backend** — Express 5 · MongoDB via Mongoose 9 · JSON Web Tokens · bcryptjs · Helmet ·
express-rate-limit · cookie-parser · node-cron

**Tooling & Tests** — Vitest · Supertest · mongodb-memory-server · ESLint · ts-node / nodemon

### 🏗️ Architecture

Feature-based frontend, layered (MVC) backend:

```
.
├── src/                      # Next.js frontend
│   ├── app/                  # App Router pages (admin/ & user/ areas)
│   ├── features/            # Feature modules: api · hooks · schema · components
│   ├── shared/              # Cross-feature: ui lib, axios, query keys, types
│   └── components/ui/        # shadcn/ui primitives
│
└── server/                   # Express backend
    ├── app.ts                # createApp() — configured app (mountable in tests)
    ├── server.ts             # bootstrap: db connect, cron, listen
    ├── routes/               # Route definitions + auth/role guards
    ├── controllers/          # Request handlers
    ├── models/               # Mongoose schemas
    ├── middleware/           # auth, roleCheck, rateLimiter, asyncHandler
    ├── utils/                # jwt, queryHelpers, dateHelper, eventBus, cronJobs
    └── __tests__/            # Vitest integration tests
```

The frontend (port `3000`) talks to the backend API (port `5000`) over `withCredentials` so the
auth cookie travels automatically.

### 🚀 Getting Started

**Prerequisites:** Node.js ≥ 20 (developed on v22) and a MongoDB instance (local or Atlas).

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in your own values
cp .env.example .env

# 3. (Optional) seed an initial admin
npm run seed

# 4. Run frontend (3000) + backend (5000) together
npm run dev
```

Then open <http://localhost:3000>.

#### Environment variables (`.env`)

Copy [`.env.example`](.env.example) to `.env` and fill in your own values — every value is left
blank so nothing real is committed. Expected format is shown in the comments:

```env
# Server
PORT=                 # e.g. 5000
NODE_ENV=             # development | production

# Database
MONGODB_URI=          # your MongoDB connection string

# Auth — generate a unique secret: openssl rand -base64 48
JWT_SECRET=           # random string, at least 32 characters
JWT_EXPIRE=           # e.g. 1d, 12h

# CORS / cookie
FRONTEND_URL=         # e.g. http://localhost:3000
# COOKIE_SAMESITE=    # lax (default) | none for cross-site deploys (forces Secure)

# Frontend → backend API base URL
NEXT_PUBLIC_API_URL=  # e.g. http://localhost:5000/api
```

> The server **refuses to start** with a missing, too-short, or placeholder `JWT_SECRET` — this
> is intentional fail-fast security.

### 📜 Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Frontend + backend in watch mode (concurrently) |
| `npm run build` | Production build (Next.js + backend TypeScript) |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint over the project |
| `npm test` | Run the Vitest integration suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Vitest with a V8 coverage report |
| `npm run seed` | Seed the database |

Each side can be run alone with the `:frontend` / `:backend` variants (e.g. `npm run dev:backend`).

### 🧪 Testing

Backend integration tests run the **real Express app** through HTTP (Supertest) against an
in-memory MongoDB (`mongodb-memory-server`) — no external database needed.

```bash
npm test
```

Current coverage (18 tests): login & cookie handling, admin-only registration (no privilege
escalation), profile auth, the SSE-only `?token=` restriction, IDOR protection on
schedules/courses/coverage, admin-only route gating, and login brute-force rate limiting.

### 🔒 Security Highlights

- JWT delivered via **`httpOnly` cookie** (invisible to client-side JS / XSS) with a short TTL
- **Fail-fast `JWT_SECRET`** validation (rejects placeholders & weak secrets)
- **Helmet** security headers + **rate limiting** (global API + strict login limiter)
- **Object-level authorization** (IDOR-safe): every record is scoped to its owner or an admin
- Input type-guards against **NoSQL operator injection**; passwords hashed with **bcrypt**
- Secrets are read from the environment and kept out of version control (`.env` is git-ignored)

---

## 🇮🇩 Bahasa Indonesia

Pekerja melakukan check-in pada shift yang ditugaskan, meminta rekan menggantikan shift, dan
mengirim jadwal kuliah; admin mengelola jadwal, memantau absensi secara realtime, dan mengekspor
laporan.

### ✨ Fitur

| Domain | Fungsinya |
| --- | --- |
| 🔐 **Autentikasi** | JWT di cookie `httpOnly`, password di-hash bcrypt, pembuatan akun hanya oleh admin |
| 🕒 **Absensi** | Check-in shift (5 shift × 2 pos), riwayat pribadi, rekap bulanan (periode tgl 15→14) |
| 📅 **Penjadwalan** | Admin menetapkan shift mingguan dengan aturan kapasitas (maks 3 pekerja per shift/pos) |
| 🔁 **Pengganti Shift** | Minta rekan menggantikan shift → alur setujui / tolak / batal |
| 🎓 **Jadwal Kuliah** | Pekerja mengirim jadwal kuliah agar tidak bentrok dengan shift |
| 📡 **Realtime** | Server-Sent Events mengalirkan update absensi/jadwal ke dashboard admin |
| 📄 **Ekspor PDF** | Membuat laporan absensi sesuai kebutuhan (jsPDF di-load lazy) |
| ⏰ **Otomatisasi** | Cron job terjadwal untuk reset absensi berkala |

Dua peran: **`admin`** (kelola user, jadwal, laporan) dan **`user`** (check-in, lihat data sendiri,
minta pengganti).

### 🧰 Teknologi

**Frontend** — Next.js 16 (App Router + Turbopack) · React 19 · TypeScript · TanStack Query v5 ·
Zustand · Tailwind CSS v4 · shadcn/ui (Radix) · React Hook Form + Zod · nuqs · lucide-react ·
date-fns

**Backend** — Express 5 · MongoDB via Mongoose 9 · JSON Web Tokens · bcryptjs · Helmet ·
express-rate-limit · cookie-parser · node-cron

**Tooling & Tes** — Vitest · Supertest · mongodb-memory-server · ESLint · ts-node / nodemon

### 🏗️ Arsitektur

Frontend berbasis fitur (feature-based), backend berlapis (MVC). Lihat diagram struktur pada
bagian English di atas — frontend (port `3000`) berkomunikasi dengan API backend (port `5000`)
memakai `withCredentials` sehingga cookie auth terkirim otomatis.

### 🚀 Memulai

**Prasyarat:** Node.js ≥ 20 (dikembangkan di v22) dan instance MongoDB (lokal atau Atlas).

```bash
# 1. Install dependency
npm install

# 2. Salin template env, lalu isi nilainya sendiri
cp .env.example .env

# 3. (Opsional) seed admin awal
npm run seed

# 4. Jalankan frontend (3000) + backend (5000) sekaligus
npm run dev
```

Lalu buka <http://localhost:3000>.

#### Variabel environment (`.env`)

Salin [`.env.example`](.env.example) ke `.env` lalu isi nilainya sendiri — semua nilai sengaja
dikosongkan agar tidak ada data nyata yang ikut ter-commit. Format yang diharapkan ada di komentar:

```env
# Server
PORT=                 # mis. 5000
NODE_ENV=             # development | production

# Database
MONGODB_URI=          # connection string MongoDB Anda

# Auth — buat secret unik: openssl rand -base64 48
JWT_SECRET=           # string acak, minimal 32 karakter
JWT_EXPIRE=           # mis. 1d, 12h

# CORS / cookie
FRONTEND_URL=         # mis. http://localhost:3000
# COOKIE_SAMESITE=    # lax (default) | none untuk deploy beda domain (memaksa Secure)

# Base URL API frontend → backend
NEXT_PUBLIC_API_URL=  # mis. http://localhost:5000/api
```

> Server **menolak start** bila `JWT_SECRET` kosong, terlalu pendek, atau berupa placeholder —
> ini keamanan fail-fast yang disengaja.

### 📜 Script

| Script | Deskripsi |
| --- | --- |
| `npm run dev` | Frontend + backend mode watch (concurrently) |
| `npm run build` | Build produksi (Next.js + TypeScript backend) |
| `npm run start` | Menjalankan hasil build produksi |
| `npm run lint` | ESLint untuk seluruh project |
| `npm test` | Menjalankan suite integrasi Vitest sekali |
| `npm run test:watch` | Vitest mode watch |
| `npm run test:coverage` | Vitest dengan laporan coverage V8 |
| `npm run seed` | Mengisi data awal (seed) database |

Tiap sisi bisa dijalankan sendiri dengan varian `:frontend` / `:backend` (mis. `npm run dev:backend`).

### 🧪 Pengujian

Tes integrasi backend menjalankan **aplikasi Express asli** lewat HTTP (Supertest) terhadap
MongoDB in-memory (`mongodb-memory-server`) — tanpa perlu database eksternal.

```bash
npm test
```

Cakupan saat ini (18 tes): login & penanganan cookie, registrasi admin-only (tanpa privilege
escalation), auth profil, pembatasan `?token=` khusus SSE, proteksi IDOR pada
jadwal/kuliah/pengganti, gating route admin-only, dan rate limit brute-force login.

### 🔒 Sorotan Keamanan

- JWT dikirim via **cookie `httpOnly`** (tak terbaca JS klien / XSS) dengan TTL pendek
- Validasi **`JWT_SECRET` fail-fast** (menolak placeholder & secret lemah)
- Header keamanan **Helmet** + **rate limiting** (API global + limiter login ketat)
- **Otorisasi level objek** (aman IDOR): tiap data dibatasi ke pemiliknya atau admin
- Type-guard input anti **NoSQL operator injection**; password di-hash **bcrypt**
- Secret dibaca dari environment & tidak masuk version control (`.env` di-git-ignore)

---

## 📄 License

Private project — all rights reserved. / Proyek privat — hak cipta dilindungi.
