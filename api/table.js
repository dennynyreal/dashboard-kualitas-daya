const pool = require('./db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    const { kapal, tanggal } = req.query;
    let whereClauses = ["e.status = 'Bahaya'"]; // Wajib Bahaya
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
        const query = `
            SELECT 
                to_char(e.waktu, 'YYYY-MM-DD HH24:MI') as waktu, 
                s.nama_kapal, 
                e.tegangan_v, 
                e.frekuensi_hz, 
                e.arus_a, 
                e.thd_persen, 
                e.faktor_daya, 
                e.status 
            FROM energy_readings e 
            JOIN ships s ON e.ship_id = s.id 
            ${whereClause} 
            ORDER BY e.waktu DESC
        `;
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};