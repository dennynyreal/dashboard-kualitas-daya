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
        // 1. Data Status per Kapal
        const queryKapal = `SELECT s.nama_kapal, e.status, COUNT(*) as jumlah FROM energy_readings e JOIN ships s ON e.ship_id = s.id ${whereClause} GROUP BY s.nama_kapal, e.status`;
        const resKapal = await pool.query(queryKapal, values);
        
        let chartKapal = {
            'KM Nusantara': { Normal: 0, Peringatan: 0, Bahaya: 0 },
            'KM Bahari': { Normal: 0, Peringatan: 0, Bahaya: 0 },
            'KM Samudra': { Normal: 0, Peringatan: 0, Bahaya: 0 }
        };
        resKapal.rows.forEach(row => {
            if (chartKapal[row.nama_kapal]) chartKapal[row.nama_kapal][row.status] = parseInt(row.jumlah);
        });

        // 2. Data Pelanggaran Parameter (Query terpisah dengan filter tanggal)
        const qT = await pool.query(`SELECT COUNT(*) as t FROM energy_readings e ${whereClause} ${whereClause ? "AND" : "WHERE"} ABS(tegangan_v - 400) > 20`, values);
        const qF = await pool.query(`SELECT COUNT(*) as f FROM energy_readings e ${whereClause} ${whereClause ? "AND" : "WHERE"} ABS(frekuensi_hz - 50) > 0.5`, values);
        const qH = await pool.query(`SELECT COUNT(*) as h FROM energy_readings e ${whereClause} ${whereClause ? "AND" : "WHERE"} thd_persen > 5`, values);

        res.status(200).json({
            status_per_kapal: chartKapal,
            pelanggaran_parameter: {
                thd: parseInt(qH.rows[0].h),
                tegangan: parseInt(qT.rows[0].t),
                frekuensi: parseInt(qF.rows[0].f)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};