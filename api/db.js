const { Pool } = require('pg');

// Vercel akan membaca Environment Variable yang nanti kita set di dashboardnya
// Untuk testing lokal di Node.js (jika ada), kita bisa menggunakan dotenv
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Diperlukan untuk koneksi ke Neon
    }
});

module.exports = pool;