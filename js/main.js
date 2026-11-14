// js/main.js
const API_BASE_URL = '/api'; // Untuk Vercel
let chartKapalInstance = null;
let chartPelanggaranInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});

function applyFilter() {
    loadAllData();
}

function resetTanggal() {
    document.getElementById('filterTanggal').value = '';
    loadAllData();
}

function loadAllData() {
    const kapalId = document.getElementById('filterKapal').value;
    const tanggal = document.getElementById('filterTanggal').value; 
    fetchKPI(kapalId, tanggal);
    fetchCharts(kapalId, tanggal);
    fetchTable(kapalId, tanggal);
}

function fetchKPI(kapalId, tanggal) {
    let url = `${API_BASE_URL}/kpi?kapal=${kapalId}`;
    if (tanggal) url += `&tanggal=${tanggal}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            document.getElementById('kpi-normal').innerText = `${data.persentase_normal}%`;
            document.getElementById('kpi-bahaya').innerText = `${data.jumlah_bahaya} Pembacaan`;
            document.getElementById('kpi-thd').innerText = `${data.jumlah_thd_gt_5} Pembacaan`;
            document.getElementById('kpi-tegangan').innerText = `${data.tegangan_terendah} V`;
        })
        .catch(error => console.error('Error fetching KPI:', error));
}

function fetchCharts(kapalId, tanggal) {
    let url = `${API_BASE_URL}/charts?kapal=${kapalId}`;
    if (tanggal) url += `&tanggal=${tanggal}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data && data.status_per_kapal) renderStackedBar(data.status_per_kapal);
            if (data && data.pelanggaran_parameter) renderHorizontalBar(data.pelanggaran_parameter);
        })
        .catch(error => console.error('Error fetching Charts:', error));
}

function fetchTable(kapalId, tanggal) {
    let url = `${API_BASE_URL}/table?kapal=${kapalId}`;
    if (tanggal) url += `&tanggal=${tanggal}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabelDetail');
            tbody.innerHTML = ''; 

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Tidak ada data Status Bahaya untuk filter ini.</td></tr>';
                return;
            }

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.style.backgroundColor = '#fed7d7'; 
                tr.style.color = '#9b2c2c';
                tr.innerHTML = `
                    <td style="padding: 12px;">${row.waktu}</td>
                    <td style="padding: 12px; font-weight: bold;">${row.nama_kapal}</td>
                    <td style="padding: 12px;">${row.tegangan_v}</td>
                    <td style="padding: 12px;">${row.frekuensi_hz}</td>
                    <td style="padding: 12px;">${row.arus_a}</td>
                    <td style="padding: 12px;">${row.thd_persen}</td>
                    <td style="padding: 12px;">${row.faktor_daya}</td>
                    <td style="padding: 12px; font-weight: bold;">${row.status}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching Table:', error));
}

// Fungsi renderStackedBar dan renderHorizontalBar tetap sama
function renderStackedBar(data) {
    if (!data) return; 
    const ctx = document.getElementById('chartKapal').getContext('2d');
    if (chartKapalInstance) chartKapalInstance.destroy();
    const labels = Object.keys(data);
    const datasetNormal = [], datasetPeringatan = [], datasetBahaya = [];
    labels.forEach(kapal => {
        datasetNormal.push(data[kapal]['Normal'] || 0);
        datasetPeringatan.push(data[kapal]['Peringatan'] || 0);
        datasetBahaya.push(data[kapal]['Bahaya'] || 0);
    });
    chartKapalInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [
            { label: 'Normal', data: datasetNormal, backgroundColor: '#38a169' },
            { label: 'Peringatan', data: datasetPeringatan, backgroundColor: '#ecc94b' },
            { label: 'Bahaya', data: datasetBahaya, backgroundColor: '#e53e3e' }
        ]},
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
    });
}

function renderHorizontalBar(data) {
    const ctx = document.getElementById('chartPelanggaran').getContext('2d');
    if (chartPelanggaranInstance) chartPelanggaranInstance.destroy();
    chartPelanggaranInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['THD > 5%', 'Deviasi Tegangan > 20V', 'Deviasi Frekuensi > 0.5Hz'],
            datasets: [{ label: 'Jumlah', data: [data.thd, data.tegangan, data.frekuensi], backgroundColor: ['#ecc94b', '#e53e3e', '#e53e3e'] }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true } } }
    });
}