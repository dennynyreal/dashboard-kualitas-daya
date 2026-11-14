const pool = require('./db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    const { kapal, tanggal } = req.query;
    let whereClauses = [];
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

    let whereClause = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    try {
        // Kita mengambil data Arus dan THD beserta Nama Kapal
        const query = `
            SELECT s.nama_kapal, e.arus_a, e.thd_persen 
            FROM energy_readings e 
            JOIN ships s ON e.ship_id = s.id
            ${whereClause}
            ORDER BY e.waktu ASC
        `;
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error di scatter.js:", error);
        res.status(500).json({ error: error.message });
    }
};