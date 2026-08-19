<div align="center">

# 🌸 BloxyLucy - Top Up Robux & Game Voucher

**Platform Top Up Robux Roblox Legal, Cepat, Otomatis, dan Terpercaya dengan Admin Panel Komprehensif**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

</div>

---

## 📖 Tentang Proyek

**BloxyLucy** adalah platform web modern untuk layanan top-up game Roblox Robux dan voucher game. Dirancang dengan UI/UX bertema pastel sakura yang ramah pengguna, proses transaksi instan tanpa login akun game (hanya butuh username), serta dilengkapi dengan **Panel Admin Lengkap** untuk manajemen pesanan, keuangan, produk, testimoni, dan pengaturan toko secara *real-time*.

---

## ✨ Fitur Unggulan

### 🛍️ 1. Storefront (Sisi Pelanggan)
- **🔍 Verifikasi Akun Roblox Real-Time**: Cek keberadaan akun dan preview avatar 3D/2D langsung via integrasi Roblox API.
- **💎 Pilihan Nominal & Paket Dinamis**: Harga, diskon, dan status ketersediaan tersinkronisasi otomatis dari database Supabase.
- **🏷️ Banner Promo Countdown**: Banner promo interaktif dengan timer hitung mundur dan tombol *quick-order* promo khusus.
- **💳 Pembayaran QRIS & Bukti Transfer**: Pembayaran via QRIS dengan upload bukti transfer yang dikompres otomatis di sisi browser sebelum diunggah untuk menghemat bandwidth.
- **📄 Halaman Detail Checkout**: Instruksi pembayaran langkah demi langkah dengan status pesanan yang jelas dan tautan langsung ke WhatsApp Admin.
- **⭐ Testimoni Pelanggan Terverifikasi**: Pelanggan dapat memberikan rating dan ulasan dengan verifikasi token order untuk mencegah ulasan palsu/spam.
- **🌸 Visual Effect Sakura Falling**: Efek animasi kelopak bunga sakura yang halus dan responsif di seluruh halaman.

### 🛠️ 2. Admin Panel (Sisi Pengelola)
- **🔐 Autentikasi & Proteksi Rute**: Login admin aman dengan verifikasi kredensial terenkripsi dan token sesi berbasis *cookie*.
- **📊 Dashboard Analitik**: Statistik ringkasan pesanan masuk, total omset, transaksi berhasil, dan rata-rata rating toko.
- **📦 Manajemen Pesanan Lengkap**:
  - Filter pesanan berdasarkan status (*Pending, Awaiting Activation, Processing, Completed, Cancelled*).
  - Detail pesanan interaktif, riwayat pembayaran, serta upload bukti selesai proses (*proof of delivery*).
- **🏷️ Manajemen Katalog Produk**: Tambah, edit harga, ubah jumlah Robux, atur badge *Popular* / *Best Value*, serta aktifkan/nonaktifkan paket instan.
- **📈 Laporan Keuangan & Filter Tanggal Kustom**:
  - Filter rentang tanggal fleksibel (*Custom Date Picker*).
  - Grafik tren pendapatan dan breakdown metode pembayaran (*Website QRIS vs WhatsApp Manual*).
- **💬 Manajemen & Moderasi Testimoni**:
  - Setujui (*Approve*) atau tolak (*Reject*) ulasan yang masuk.
  - Fitur **Balas Ulasan (Admin Reply)** langsung dari panel admin yang tampil di halaman storefront.
  - Jadikan testimoni sebagai *Featured* untuk diprioritaskan tampil.
- **⚙️ Pengaturan Toko Dinamis (Store Settings)**:
  - Ubah nomor WhatsApp CS, ganti gambar QRIS, logo, dan banner toko.
  - Konfigurasi judul promo banner, tag diskon, nominal robux promo, dan tanggal berakhir promo tanpa perlu redeploy kode.

---

## 🏗️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **UI Library**: [React 19](https://react.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Backend**: [Supabase](https://supabase.com/) (PostgreSQL & Row Level Security)
- **Tools / Utilities**: Canvas Image Compression API, Native Fetch

---

## 📁 Struktur Folder Proyek

```
bloxylucy/
├── app/
│   ├── admin/                 # Modul Admin Panel
│   │   ├── components/        # Komponen khusus Admin (Sidebar, Header, DatePicker)
│   │   ├── customers/         # Halaman data pelanggan
│   │   ├── finance/           # Halaman laporan keuangan & grafik
│   │   ├── login/             # Halaman login admin
│   │   ├── orders/            # Halaman daftar & detail pesanan ([id])
│   │   ├── products/          # Halaman manajemen produk
│   │   ├── settings/          # Halaman pengaturan toko & promo
│   │   └── testimonials/      # Halaman moderasi & balasan ulasan
│   ├── api/                   # API Routes (Backend Endpoints)
│   │   ├── auth/              # Auth admin (login, logout, me)
│   │   ├── checkout/          # Pemrosesan checkout pesanan
│   │   ├── customers/         # Data agregasi pelanggan
│   │   ├── orders/            # CRUD & update status pesanan
│   │   ├── products/          # CRUD produk
│   │   ├── roblox-check/      # Verifikasi username Roblox
│   │   ├── settings/          # Get & update store settings
│   │   └── testimonials/      # CRUD & token verifikasi testimoni
│   ├── checkout/              # Halaman detail & instruksi checkout
│   ├── components/            # Komponen Storefront (Navbar, Footer, NominalSection, dll)
│   ├── globals.css            # Style Tailwind v4 & tema warna pastel
│   ├── layout.tsx             # Root layout & metadata SEO
│   └── page.tsx               # Halaman utama (Home storefront)
├── lib/
│   ├── admin-auth.ts          # Helper otentikasi & hashing kredensial admin
│   ├── admin-types.ts         # TypeScript interfaces & types
│   ├── supabase.ts            # Client Supabase public
│   └── supabase-service.ts    # Service layer & Supabase query handler
├── public/
│   └── images/                # Asset gambar (logo, banner, QRIS)
├── scripts/
│   ├── generate_qris.js       # Script utilitas pembuat mockup QRIS
│   └── seed_database.js       # Script pengisi data awal ke Supabase
├── middleware.ts              # Route protection middleware Next.js
├── supabase_schema.sql        # Skema database & tabel master Supabase
└── package.json
```

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Prasyarat
Pastikan sudah menginstal:
- **Node.js**: versi 18.18.0 atau yang lebih baru
- **npm** / **yarn** / **pnpm**

### 2. Clone Repositori
```bash
git clone https://github.com/apege/bloxylucy.git
cd bloxylucy
```

### 3. Instalasi Dependency
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Buat file `.env.local` di root direktori project:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Credentials (Opsional, fallback sudah tersedia di config)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 5. Setup Database Supabase
1. Buka dashboard proyek Anda di [Supabase](https://supabase.com/).
2. Buka menu **SQL Editor**.
3. Buka file [`supabase_schema.sql`](./supabase_schema.sql) dari repositori ini, salin seluruh kodenya, dan jalankan (**Run**) di SQL Editor Supabase.
4. *(Opsional)* Jalankan script seeder lokal jika ingin mengisi data awal:
   ```bash
   node scripts/seed_database.js
   ```

### 6. Menjalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat halaman utama.  
Buka [http://localhost:3000/admin](http://localhost:3000/admin) untuk masuk ke panel admin.

---

## 🛠️ Script yang Tersedia

| Command | Fungsi |
|---|---|
| `npm run dev` | Menjalankan Next.js development server dengan Turbopack |
| `npm run build` | Melakukan build aplikasi untuk tahap produksi (*Production Build*) |
| `npm run start` | Menjalankan build produksi secara lokal |
| `npm run lint` | Menjalankan linter ESLint untuk memeriksa kualitas kode |

---

## 🚢 Deployment ke Vercel

Aplikasi ini dioptimalkan untuk di-deploy ke [Vercel](https://vercel.com/):

1. *Push* repositori Anda ke GitHub / GitLab.
2. Impor project ke dashboard Vercel.
3. Masukkan **Environment Variables** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Klik **Deploy** dan website akan langsung aktif dalam hitungan menit.

---

## 📄 Lisensi

Proyek ini dikembangkan secara privat untuk **BloxyLucy**. Seluruh hak cipta dilindungi undang-undang.
