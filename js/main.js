// js/main.js
// const API_BASE_URL = 'http://localhost/dashboard-kualitas-daya/api';
const API_BASE_URL = '/api';
let chartKapalInstance = null;
let chartPelanggaranInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAllData('all');
});

// Fungsi yang dipanggil saat Dropdown diubah
function applyFilter() {
    const kapalId = document.getElementById('filterKapal').value;
    loadAllData(kapalId);
}

function loadAllData(kapalId) {
    fetchKPI(kapalId);
    fetchCharts(kapalId);
    fetchTable(kapalId);
}

// 1. Fetch KPI
function fetchKPI(kapalId) {
    fetch(`${API_BASE_URL}/kpi.js?kapal=${kapalId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('kpi-normal').innerText = `${data.persentase_normal}%`;
            document.getElementById('kpi-bahaya').innerText = `${data.jumlah_bahaya} Pembacaan`;
            document.getElementById('kpi-thd').innerText = `${data.jumlah_thd_gt_5} Pembacaan`;
            document.getElementById('kpi-tegangan').innerText = `${data.tegangan_terendah} V`;
        });
}

// 2. Fetch Charts
function fetchCharts(kapalId) {
    fetch(`${API_BASE_URL}/charts?kapal=${kapalId}`)
        .then(res => {
            if (!res.ok) throw new Error("Gagal mengambil data grafik");
            return res.json();
        })
        .then(data => {
            // Pastikan data tidak kosong sebelum dirender
            if (data && data.status_per_kapal) {
                renderStackedBar(data.status_per_kapal);
            }
            if (data && data.pelanggaran_parameter) {
                renderHorizontalBar(data.pelanggaran_parameter);
            }
        })
        .catch(error => console.error('Error fetching Charts:', error));
}

// 3. Fetch Tabel Detail
function fetchTable(kapalId) {
    fetch(`${API_BASE_URL}/table.js?kapal=${kapalId}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabelDetail');
            tbody.innerHTML = ''; // Kosongkan tabel

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Tidak ada data Status Bahaya untuk filter ini.</td></tr>';
                return;
            }

            data.forEach(row => {
                const tr = document.createElement('tr');
                // Beri warna merah muda untuk baris bahaya
                tr.style.backgroundColor = '#fed7d7'; 
                tr.style.color = '#9b2c2c';
                tr.style.borderBottom = '1px solid #feb2b2';

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
        });
}

// 4. Render Grafik (Destroy instance lama agar tidak tumpang tindih)
function fetchCharts(kapalId) {
    fetch(`${API_BASE_URL}/charts?kapal=${kapalId}`)
        .then(res => {
            if (!res.ok) throw new Error("Gagal mengambil data grafik");
            return res.json();
        })
        .then(data => {
            // Pastikan data tidak kosong sebelum dirender
            if (data && data.status_per_kapal) {
                renderStackedBar(data.status_per_kapal);
            }
            if (data && data.pelanggaran_parameter) {
                renderHorizontalBar(data.pelanggaran_parameter);
            }
        })
        .catch(error => console.error('Error fetching Charts:', error));
}

function renderHorizontalBar(data) {
    const ctx = document.getElementById('chartPelanggaran').getContext('2d');
    if (chartPelanggaranInstance) chartPelanggaranInstance.destroy();

    chartPelanggaranInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['THD > 5%', 'Deviasi Tegangan > 20V', 'Deviasi Frekuensi > 0.5Hz'],
            datasets: [{
                label: 'Jumlah',
                data: [data.thd, data.tegangan, data.frekuensi],
                backgroundColor: ['#ecc94b', '#e53e3e', '#e53e3e']
            }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true } } }
    });
}