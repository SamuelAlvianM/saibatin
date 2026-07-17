-- ---------------------------------------------------------------------------
-- Migrasi WILAYAH (kecamatan + pekon/kelurahan) dari DB portal lama.
--
-- Sumber : saibatin_lama.m_setup_kec (11) + m_setup_kel (118)
-- Target : saibatin.m_wilayah (model Wilayah) — dipakai dropdown opt/optx
--          pada form permohonan.
--
-- Jalankan dari DB target:
--   mysql -u root saibatin < scripts/migrasi-wilayah-db-lama.sql
--
-- CATATAN
-- 1. Kode wilayah Kabupaten Pesisir Barat berawalan 1813 (prop 18).
--    Jangan sampai kemasukan kode kabupaten lain.
-- 2. Kecamatan dimasukkan lebih dulu supaya parent_id pekon bisa dipetakan.
-- 3. Mengganti SELURUH isi m_wilayah (migrasi = sumber kebenaran).
-- ---------------------------------------------------------------------------

DELETE FROM m_wilayah;

-- Kecamatan (level 4). Kode = m_setup_kec.id, mis. 181301.
INSERT INTO m_wilayah (kode, nama, jenis, parent_id)
SELECT CAST(k.id AS CHAR), TRIM(k.nama_kec), 'KECAMATAN', NULL
FROM saibatin_lama.m_setup_kec k
WHERE k.status = 1 AND k.no_kab = 1813
ORDER BY k.sort, k.id;

-- Pekon/kelurahan (level 5). Kode = m_setup_kel.no_kel, mis. 1813011005.
-- parent_id ditarik dari kecamatan yang barusan dimasukkan lewat no_kec.
INSERT INTO m_wilayah (kode, nama, jenis, parent_id)
SELECT CAST(l.no_kel AS CHAR), TRIM(l.nama_kel), 'KELURAHAN', p.id
FROM saibatin_lama.m_setup_kel l
JOIN m_wilayah p ON p.kode = CAST(l.no_kec AS CHAR) AND p.jenis = 'KECAMATAN'
WHERE l.status = 1 AND l.no_kab = 1813
ORDER BY l.no_kec, l.sort, l.no_kel;
