# Yui Crypto Airdrop Dashboard

Dashboard web app bertema anime girl **"Yui"** untuk mengelola airdrop crypto, terintegrasi dengan Cloudflare Workers + KV.

## Fitur Utama
1. **Login OTP**: Mendukung verifikasi OTP 6-digit (dikirim via Telegram bot) dan OTP 8-karakter (dihasilkan langsung oleh Telegram bot).
2. **Karakter Yui**: Menampilkan ilustrasi Yui dengan kutipan pembicaraan yang berubah dinamis menyesuaikan mood-nya (berdasarkan status deadline/pending airdrop Anda).
3. **Statistik Airdrop**: Cards interaktif untuk total, pending, done, claim, dan gagal.
4. **Detail Airdrop**: Checklist task per airdrop, progress bar, AI Insight, dan estimasi hitung mundur (countdown).
5. **CSV Export**: Unduh daftar airdrop dalam format CSV.
6. **Dark Mode**: Toggle tema gelap dan terang dengan skema warna pastel yang premium.

## Struktur Repositori
- `/frontend`: React + Vite + TypeScript + Tailwind CSS v4 + Framer Motion.
- `/backend`: Node/Express simulator untuk Cloudflare Worker & KV database (mempermudah development lokal).
- `/worker`: Kode produksi Cloudflare Worker (sudah diperbaiki bug dekode token JWT).

## Cara Menjalankan Lokal

### 1. Install Dependensi
Dari direktori root, jalankan perintah berikut untuk menginstal semua library di root, frontend, dan backend:
```bash
npm run install:all
```

### 2. Konfigurasi Environment (Opsional)
Jika ingin menghubungkan simulator backend ke Telegram bot asli untuk mengirim OTP, buat file `/backend/.env` (salin dari `.env.example`) dan isi `BOT_TOKEN`. Jika dikosongkan, OTP akan tetap bekerja dan dicetak di log terminal backend.

### 3. Jalankan Server Dev
Mulai backend simulator dan frontend secara bersamaan dengan satu perintah:
```bash
npm run dev
```
- Frontend akan berjalan di: `http://localhost:5173`
- Backend simulator berjalan di: `http://localhost:3001`

### 4. Cara Pengujian Login OTP di Lokal
1. Buka dashboard di browser.
2. Masukkan ID Telegram Anda (angka sembarang untuk lokal, misal `12345`).
3. Klik **"Kirim OTP via Telegram"**.
4. Lihat console/terminal tempat backend simulator berjalan. Anda akan melihat log yang menampilkan kode OTP 6-digit.
5. Masukkan kode tersebut di halaman login untuk masuk.

## Deploy ke Cloudflare
Untuk deploy API Worker ke Cloudflare:
1. Masuk ke folder `/worker`.
2. Pastikan file `wrangler.toml` sudah sesuai dengan namespace KV Anda.
3. Jalankan `npx wrangler deploy`.
