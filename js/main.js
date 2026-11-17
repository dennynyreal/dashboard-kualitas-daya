// js/main.js

// Konfigurasi Global Chart.js
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
Chart.defaults.color = '#7C8FAC';
Chart.defaults.scale.grid.color = '#EAEFF4';
Chart.defaults.scale.grid.borderDash = [5, 5];

const API_BASE_URL = '/api';
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
    fetchHeatmap(kapalId, tanggal); 
}

// ==========================================
// 1. KPI
// ==========================================
function fetchKPI(kapalId, tanggal) {
    let url = `${API_BASE_URL}/kpi?kapal=${kapalId}`;
    if (tanggal) url += `&tanggal=${tanggal}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            document.getElementById('kpi-normal').innerText = `${data.persentase_normal}%`;
            document.getElementById('kpi-bahaya').innerText = data.jumlah_bahaya; 
            document.getElementById('kpi-thd').innerText = data.jumlah_thd_gt_5;
            document.getElementById('kpi-tegangan').innerText = `${data.tegangan_terendah} V`;
        })
        .catch(error => console.error('Error fetching KPI:', error));
}

// ==========================================
// 2. CHARTS (Stacked & Horizontal)
// ==========================================
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
                { label: 'Normal', data: datasetNormal, backgroundColor: '#5D87FF', borderRadius: 4 },
                { label: 'Peringatan', data: datasetPeringatan, backgroundColor: '#FFAE1F', borderRadius: 4 },
                { label: 'Bahaya', data: datasetBahaya, backgroundColor: '#FA896B', borderRadius: 4 }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                x: { stacked: true, grid: { display: false } }, 
                y: { stacked: true, beginAtZero: true } 
            },
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
            }
        }
    });
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
                backgroundColor: ['#FFAE1F', '#FA896B', '#FA896B'],
                borderRadius: 6
            }]
        },
        options: { 
            indexAxis: 'y', 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                x: { beginAtZero: true },
                y: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ==========================================
// 3. TABEL
// ==========================================
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
                tr.classList.add('danger-row'); 
                tr.innerHTML = `
                    <td>${row.waktu}</td>
                    <td style="font-weight: 700;">${row.nama_kapal}</td>
                    <td>${row.tegangan_v}</td>
                    <td>${row.frekuensi_hz}</td>
                    <td>${row.arus_a}</td>
                    <td>${row.thd_persen}</td>
                    <td>${row.faktor_daya}</td>
                    <td style="font-weight: 700;">${row.status}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching Table:', error));
}

// ==========================================
// 4. SCATTER PLOT
// ==========================================
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

    const kapalNames = ['KM Nusantara', 'KM Bahari', 'KM Samudra'];
    const colors = { 'KM Nusantara': '#5D87FF', 'KM Bahari': '#49BEFF', 'KM Samudra': '#FA896B' };
    
    const datasets = kapalNames.map(kapal => {
        const filteredData = data.filter(d => d.nama_kapal === kapal);
        return {
            label: kapal,
            data: filteredData.map(d => ({ x: parseFloat(d.arus_a), y: parseFloat(d.thd_persen) })),
            backgroundColor: colors[kapal],
            pointRadius: 5,
            pointHoverRadius: 7
        };
    });

    chartScatterInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Arus (A)', font: {weight: 'bold'} }, beginAtZero: false },
                y: { title: { display: true, text: 'THD (%)', font: {weight: 'bold'} }, beginAtZero: true }
            },
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
                tooltip: {
                    backgroundColor: 'rgba(42, 53, 71, 0.9)',
                    padding: 10,
                    cornerRadius: 4,
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

// ==========================================
// 5. HEATMAP
// ==========================================
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

    const rawDates = [...new Set(data.map(d => d.tanggal))].sort();
    const labelsX = rawDates.map(d => {
        const parts = d.split('-');
        return `${parts[2]}/${parts[1]}`; 
    });

    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0') + ':00');

    const heatmapData = data.map(d => ({
        x: rawDates.indexOf(d.tanggal),
        y: parseInt(d.jam),
        v: parseInt(d.jumlah)
    }));

    const maxVal = Math.max(...heatmapData.map(d => d.v), 1);

    chartHeatmapInstance = new Chart(ctx, {
        type: 'matrix',
        data: {
            datasets: [{
                label: 'Jumlah Kejadian',
                data: heatmapData,
                backgroundColor(c) {
                    const value = c.dataset.data[c.dataIndex].v;
                    const alpha = (value / maxVal);
                    return `rgba(250, 137, 107, ${alpha})`; 
                },
                borderColor: '#FFFFFF',
                borderWidth: 2,
                borderRadius: 4,
                width: ({chart}) => (chart.chartArea || {}).width / rawDates.length - 2,
                height: ({chart}) => (chart.chartArea || {}).height / 24 - 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'category',
                    labels: labelsX, 
                    title: { display: true, text: 'Tanggal', font: {weight: 'bold'} },
                    grid: { display: false },
                    ticks: {
                        autoSkip: false, 
                        maxRotation: 45, 
                        minRotation: 45
                    }
                },
                y: {
                    type: 'category',
                    labels: hours,
                    title: { display: true, text: 'Jam', font: {weight: 'bold'} },
                    grid: { display: false },
                    reverse: true
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: () => 'Detail Kejadian',
                        label: (context) => {
                            const v = context.raw.v;
                            const tgl = rawDates[context.raw.x]; 
                            const jam = hours[context.raw.y];
                            return `${tgl} jam ${jam}: ${v} kejadian abnormal`;
                        }
                    }
                }
            }
        }
    });
}