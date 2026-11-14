// js/main.js
const API_BASE_URL = '/api'; // Untuk Vercel
let chartKapalInstance = null;
let chartPelanggaranInstance = null;
let chartScatterInstance = null;
let chartHeatmapInstance = null;

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
    fetchScatter(kapalId, tanggal);
    fetchHeatmap(kapalId, tanggal); // <-- TAMBAHKAN INI
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

// 4. Fetch dan Render Scatter Plot
function fetchScatter(kapalId, tanggal) {
    let url = `${API_BASE_URL}/scatter?kapal=${kapalId}`;
    if (tanggal) url += `&tanggal=${tanggal}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderScatter(data);
        })
        .catch(error => console.error('Error fetching Scatter:', error));
}

function renderScatter(data) {
    const ctx = document.getElementById('chartScatter').getContext('2d');
    if (chartScatterInstance) chartScatterInstance.destroy();

    // Memisahkan data berdasarkan kapal untuk diberi warna berbeda
    const kapalNames = ['KM Nusantara', 'KM Bahari', 'KM Samudra'];
    const colors = { 'KM Nusantara': '#38a169', 'KM Bahari': '#ecc94b', 'KM Samudra': '#e53e3e' };
    
    const datasets = kapalNames.map(kapal => {
        const filteredData = data.filter(d => d.nama_kapal === kapal);
        return {
            label: kapal,
            data: filteredData.map(d => ({ x: parseFloat(d.arus_a), y: parseFloat(d.thd_persen) })),
            backgroundColor: colors[kapal],
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });

    chartScatterInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Arus (A)' }, beginAtZero: false },
                y: { title: { display: true, text: 'THD (%)' }, beginAtZero: true }
            },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: Arus ${context.parsed.x} A, THD ${context.parsed.y}%`;
                        }
                    }
                }
            }
        }
    });
}

// 5. Fetch dan Render Heatmap
function fetchHeatmap(kapalId, tanggal) {
    let url = `${API_BASE_URL}/heatmap?kapal=${kapalId}`;
    if (tanggal) url += `&tanggal=${tanggal}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderHeatmap(data);
        })
        .catch(error => console.error('Error fetching Heatmap:', error));
}

function renderHeatmap(data) {
    const ctx = document.getElementById('chartHeatmap').getContext('2d');
    if (chartHeatmapInstance) chartHeatmapInstance.destroy();

    // Menyiapkan label tanggal unik dan label jam (0-23)
    const uniqueDates = [...new Set(data.map(d => d.tanggal))].sort();
    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0') + ':00');

    // Mengubah data ke format yang diminta Chart.js Matrix
    const heatmapData = data.map(d => ({
        x: uniqueDates.indexOf(d.tanggal),
        y: parseInt(d.jam),
        v: parseInt(d.jumlah)
    }));

    // Mencari nilai maksimum untuk menentukan skala warna
    const maxVal = Math.max(...heatmapData.map(d => d.v), 1);

    chartHeatmapInstance = new Chart(ctx, {
        type: 'matrix',
        data: {
            datasets: [{
                label: 'Jumlah Kejadian',
                data: heatmapData,
                backgroundColor(c) {
                    const value = c.dataset.data[c.dataIndex].v;
                    // Warna dari kuning (rendah) ke merah (tinggi)
                    const alpha = (value / maxVal);
                    return `rgba(229, 62, 62, ${alpha})`; // Merah dengan transparansi
                },
                borderColor: '#fff',
                borderWidth: 1,
                width: ({chart}) => (chart.chartArea || {}).width / uniqueDates.length - 1,
                height: ({chart}) => (chart.chartArea || {}).height / 24 - 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'category',
                    labels: uniqueDates,
                    title: { display: true, text: 'Tanggal' },
                    grid: { display: false }
                },
                y: {
                    type: 'category',
                    labels: hours,
                    title: { display: true, text: 'Jam' },
                    grid: { display: false },
                    reverse: true // Agar jam 00:00 ada di atas
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: () => 'Detail Kejadian',
                        label: (context) => {
                            const v = context.raw.v;
                            const tgl = uniqueDates[context.raw.x];
                            const jam = hours[context.raw.y];
                            return `${tgl} jam ${jam}: ${v} kejadian abnormal`;
                        }
                    }
                }
            }
        }
    });
}