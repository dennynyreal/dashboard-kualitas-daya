# Dashboard Kualitas Daya Panel Utama (Skenario C)

Aplikasi Business Intelligence (BI) berbasis web untuk memantau kualitas daya kelistrikan pada panel utama kapal. Proyek ini dikembangkan untuk mata kuliah Komputer & Big Data (EE38110).

## 🚀 Demo Aplikasi
- **Link Aplikasi (Vercel):** [https://dashboard-kualitas-daya.vercel.app/](https://dashboard-kualitas-daya.vercel.app/)

## ✨ Fitur Utama
- **KPI Dinamis:** Menghitung persentase normal, jumlah bahaya, THD > 5%, dan tegangan terendah secara *real-time*.
- **Visualisasi Data:** Stacked Bar Chart (Status per Kapal) dan Horizontal Bar Chart (Pelanggaran Parameter).
- **Tabel Detail:** Menampilkan riwayat pembacaan kritis (Status Bahaya) dengan filter kapal.
- **Filter Interaktif:** Menyaring seluruh data berdasarkan kapal (Nusantara, Bahari, Samudra).

## 🛠️ Teknologi yang Digunakan
- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Chart.js
- **Backend (Serverless):** Node.js, Vercel Serverless Functions
- **Database (Produksi):** PostgreSQL (Neon.tech)
- **Database (Lokal):** MySQL (XAMPP)

## 📊 Dataset
Data yang digunakan adalah `kualitas_daya_panel.csv` yang berisi 1.008 baris pengukuran dari 3 kapal selama periode 1–14 September 2026. Parameter yang diukur meliputi Tegangan (V), Frekuensi (Hz), Arus (A), THD (%), dan Faktor Daya.

## 💻 Cara Menjalankan Secara Lokal
1. Clone repositori ini.
2. Pastikan Anda memiliki Node.js terinstal.
3. Jalankan `npm install` untuk menginstal dependensi.
4. Buat file `.env` dan tambahkan `DATABASE_URL` Anda.
5. Jalankan `vercel dev` atau gunakan XAMPP untuk versi PHP-nya.

---
*Dibuat oleh [TIM 3] - [D3PE3C]*