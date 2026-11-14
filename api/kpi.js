const pool = require('./db');

module.exports = async (req, res) => {
    // Mengizinkan CORS agar frontend bisa mengakses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    // Menangkap parameter filter dari URL
    const { kapal, tanggal } = req.query;
    let whereClauses = [];
    let values = [];
    let paramCount = 1;

    // Filter berdasarkan Kapal
    if (kapal && kapal !== 'all' && !isNaN(kapal)) {
        whereClauses.push(`ship_id = $${paramCount}`);
        values.push(parseInt(kapal));
        paramCount++;
    }
    
    // Filter berdasarkan Tanggal (Format: YYYY-MM-DD)
    if (tanggal) {
        // DATE() digunakan untuk mengambil bagian tanggal saja dari kolom TIMESTAMP
        whereClauses.push(`DATE(waktu) = $${paramCount}`);
        values.push(tanggal);
        paramCount++;
    }

    // Menggabungkan klausa WHERE jika ada filter yang dipilih
    let whereClause = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    try {
        // 1. Persentase Pembacaan Normal
        const queryNormal = `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Normal' THEN 1 ELSE 0 END) as total_normal FROM energy_readings ${whereClause}`;
        const resNormal = await pool.query(queryNormal, values);
        const dataNormal = resNormal.rows[0];
        const total = parseInt(dataNormal.total) || 0;
        const totalNormal = parseInt(dataNormal.total_normal) || 0;
        const persenNormal = total > 0 ? (totalNormal / total) * 100 : 0;

        // 2. Jumlah Pembacaan Bahaya
        const queryBahaya = `SELECT COUNT(*) as total FROM energy_readings ${whereClause} ${whereClause ? "AND" : "WHERE"} status = 'Bahaya'`;
        const resBahaya = await pool.query(queryBahaya, values);
        
        // 3. Jumlah Pembacaan THD > 5%
        const queryThd = `SELECT COUNT(*) as total FROM energy_readings ${whereClause} ${whereClause ? "AND" : "WHERE"} thd_persen > 5`;
        const resThd = await pool.query(queryThd, values);

        // 4. Tegangan Terendah
        const queryVolt = `SELECT MIN(tegangan_v) as min_v FROM energy_readings ${whereClause}`;
        const resVolt = await pool.query(queryVolt, values);

        // Mengirim response JSON
        res.status(200).json({
            persentase_normal: parseFloat(persenNormal.toFixed(2)),
            jumlah_bahaya: parseInt(resBahaya.rows[0].total),
            jumlah_thd_gt_5: parseInt(resThd.rows[0].total),
            tegangan_terendah: resVolt.rows[0].min_v ? parseFloat(resVolt.rows[0].min_v) : 0
        });

    } catch (error) {
        // Menampilkan error di log Vercel jika terjadi masalah
        console.error("Error di kpi.js:", error);
        res.status(500).json({ error: error.message });
    }
};