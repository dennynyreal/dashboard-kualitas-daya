const pool = require('./db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    const { kapal } = req.query;
    let whereClause = "WHERE e.status = 'Bahaya'";
    let values = [];

    if (kapal && kapal !== 'all' && !isNaN(kapal)) {
        whereClause += " AND e.ship_id = $1";
        values.push(parseInt(kapal));
    }

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