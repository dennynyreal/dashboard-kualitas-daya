# ⚡ Dashboard Kualitas Daya Panel Utama (Skenario C)

Aplikasi Business Intelligence (BI) berbasis web untuk memantau kualitas daya kelistrikan pada panel utama kapal. Proyek ini dikembangkan untuk mata kuliah Komputer & Big Data (EE38110) dari tahap perancangan wireframe hingga menjadi aplikasi web full-stack yang dapat diakses secara online.

## 🚀 Live Demo
- **Aplikasi:** [https://dashboard-kualitas-daya.vercel.app/](https://dashboard-kualitas-daya.vercel.app/) *(Ganti dengan URL Vercel Anda)*

## ✨ Fitur Utama
- **4 KPI Dinamis:** Persentase Normal, Jumlah Bahaya, THD > 5%, dan Tegangan Terendah.
- **5 Visualisasi Interaktif:**
  1. Stacked Bar Chart (Status per Kapal)
  2. Horizontal Bar Chart (Pelanggaran Parameter)
  3. Scatter Plot (Korelasi Arus vs THD)
  4. Heatmap Matrix (Pola Waktu Kejadian Abnormal Tanggal x Jam)
  5. Tabel Detail (Pembacaan Status Bahaya)
- **2 Filter Interaktif:** Filter Kapal dan Filter Tanggal (Cross-filtering ke seluruh dashboard).

## 🛠️ Teknologi yang Digunakan
- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Chart.js & Chart.js Matrix Plugin.
- **Backend (Serverless API):** Node.js (Vercel Serverless Functions).
- **Database (Produksi):** PostgreSQL (Neon.tech).
- **Database (Lokal):** MySQL (XAMPP).

## 📊 Dataset
Data yang digunakan adalah `kualitas_daya_panel.csv` yang berisi 1.008 baris pengukuran dari 3 kapal (KM Nusantara, KM Bahari, KM Samudra) selama periode 1–14 September 2026.

## 💻 Cara Menjalankan Secara Lokal (Development)
1. Clone repositori ini.
2. Jalankan `npm install` untuk menginstal dependensi (seperti `pg`).
3. Buat file `.env` dan tambahkan `DATABASE_URL` dari Neon Anda.
4. Jalankan `vercel dev` untuk menjalankan serverless functions secara lokal, atau gunakan XAMPP (untuk versi PHP) dengan meng-import `database.sql`.

## 📝 Lisensi & Kredit
Proyek ini dibuat untuk keperluan akademik (Tugas Kelompok Komputer & Big Data - EE38110). 

Dikembangkan dan dipelihara oleh **@psdm_autoshipsmrc**. 
Bebas digunakan untuk referensi pembelajaran.