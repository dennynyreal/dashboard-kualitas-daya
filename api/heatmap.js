const pool = require('./db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    const { kapal, tanggal } = req.query;
    let whereClauses = ["e.status != 'Normal'"]; // Heatmap hanya butuh data abnormal
    let values = [];
    let paramCount = 1;

    if (kapal && kapal !== 'all' && !isNaN(kapal)) {
        whereClauses.push(`e.ship_id = $${paramCount}`);
        values.push(parseInt(kapal));
        paramCount++;
    }
    if (tanggal) {
        whereClauses.push(`DATE(e.waktu) = $${paramCount}`);
        values.push(tanggal);
        paramCount++;
    }

    let whereClause = "WHERE " + whereClauses.join(" AND ");

    try {
        // Mengambil tanggal (YYYY-MM-DD) dan jam (00-23) lalu menghitung jumlah kejadiannya
        const query = `
            SELECT 
                to_char(e.waktu, 'YYYY-MM-DD') as tanggal, 
                EXTRACT(HOUR FROM e.waktu) as jam, 
                COUNT(*) as jumlah
            FROM energy_readings e
            ${whereClause}
            GROUP BY tanggal, jam
            ORDER BY tanggal, jam
        `;
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error di heatmap.js:", error);
        res.status(500).json({ error: error.message });
    }
};