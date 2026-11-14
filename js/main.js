// js/main.js
const API_BASE_URL = '/api';
let chartKapalInstance = null;
let chartPelanggaranInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});

// Fungsi yang dipanggil saat Dropdown / Tanggal diubah
function applyFilter() {
    loadAllData();
}

function resetFilterTanggal() {
    document.getElementById('filterTanggal').value = ''; // Kosongkan input tanggal
    loadAllData();
}

function loadAllData() {
    const kapalId = document.getElementById('filterKapal').value;
    const tanggalValue = document.getElementById('filterTanggal').value; // Format: YYYY-MM-DD

    fetchKPI(kapalId, tanggalValue);
    fetchCharts(kapalId, tanggalValue);
    fetchTable(kapalId, tanggalValue);
}

// 1. Fetch KPI
function fetchKPI(kapalId, tanggal) {
    let url = `${API_BASE_URL}/kpi?kapal=${kapalId}`;
    if (tanggal) url += `&tanggal=${tanggal}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => { /* ... (kode innerText KPI tetap sama) ... */ })
        .catch(error => console.error('Error fetching KPI:', error));
}

// 2. Fetch Charts
function fetchCharts(kapalId, tanggal) {
    let url = `${API_BASE_URL}/charts?kapal=${kapalId}`;
    if (tanggal) url += `&tanggal=${tanggal}`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Gagal mengambil data grafik");
            return res.json();
        })
        .then(data => {
            if (data && data.status_per_kapal) renderStackedBar(data.status_per_kapal);
            if (data && data.pelanggaran_parameter) renderHorizontalBar(data.pelanggaran_parameter);
        })
        .catch(error => console.error('Error fetching Charts:', error));
}

// 3. Fetch Tabel Detail
function fetchTable(kapalId, tanggal) {
    let url = `${API_BASE_URL}/table?kapal=${kapalId}`;
    if (tanggal) url += `&tanggal=${tanggal}`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        })
        .then(data => { /* ... (kode render tabel tetap sama) ... */ })
        .catch(error => console.error('Error fetching Table:', error));
}

// 4. Render Stacked Bar
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
        data: {
            labels: labels,
            datasets: [
                { label: 'Normal', data: datasetNormal, backgroundColor: '#38a169' },
                { label: 'Peringatan', data: datasetPeringatan, backgroundColor: '#ecc94b' },
                { label: 'Bahaya', data: datasetBahaya, backgroundColor: '#e53e3e' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
    });
}

// 5. Render Horizontal Bar
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