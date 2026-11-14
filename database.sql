-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS db_kualitas_daya;
USE db_kualitas_daya;

-- 2. Buat Tabel Kapal
CREATE TABLE ships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kapal VARCHAR(50) NOT NULL
);

-- 3. Buat Tabel Pembacaan
CREATE TABLE energy_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    waktu DATETIME NOT NULL,
    ship_id INT NOT NULL,
    tegangan_v FLOAT NOT NULL,
    frekuensi_hz FLOAT NOT NULL,
    arus_a FLOAT NOT NULL,
    thd_persen FLOAT NOT NULL,
    faktor_daya FLOAT NOT NULL,
    status ENUM('Normal', 'Peringatan', 'Bahaya') NOT NULL,
    FOREIGN KEY (ship_id) REFERENCES ships(id)
);

-- 4. Isi Data Kapal
INSERT INTO ships (nama_kapal) VALUES 
('KM Nusantara'), 
('KM Bahari'), 
('KM Samudra');

-- Catatan: Untuk 1.008 baris data CSV, kita TIDAK akan mengetik manual.
-- Kita akan menggunakan script PHP untuk mengimpor CSV secara otomatis.