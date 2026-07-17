-- ---------------------------------------------------------------------------
-- Migrasi data demografi dari DB portal lama (m_maps_dapduks, EAV per wilayah)
-- ke tabel baru `m_demografi_wilayah` (satu baris per kategori+wilayah, JSON).
--
-- Sumber : DB lama hasil import dump cPanel `saibatinpesibar_db.pesbar.002`
--          (di lokal bernama `saibatin_lama`).
-- Target : DB aplikasi (Prisma) — tabel `m_demografi_wilayah`.
-- Periode: tahun 2024 semester 2 (periode lengkap terakhir; 2025 s1 parsial).
--
-- Jalankan dari DB target, mis.:
--   mysql -u root saibatin < scripts/migrasi-demografi-db-lama.sql
-- Ganti @SRC bila nama DB sumber berbeda (di server produksi import dulu
-- dump lama sebagai `saibatin_lama`, atau sesuaikan nama skema di bawah).
--
-- Kode wilayah lama sudah sesuai standar Kemendagri yang dipakai parser Excel
-- (lib/demografi-import.ts): 6 digit = kecamatan (level 4), 10 digit = pekon
-- (level 5, parent_kode = 6 digit pertama). Baris kabupaten (4 digit) dilewati
-- karena tampilan menjumlah dari pekon.
-- ---------------------------------------------------------------------------

SET @TAHUN = 2024, @SEMESTER = 2;

-- Import = sumber kebenaran → kosongkan kategori yang diisi ulang.
DELETE FROM m_demografi_wilayah WHERE kategori IN (
  'jenis-kelamin','agama','gol-darah','pekerjaan','pendidikan',
  'status-kawin','kk','wajib-ktp'
);

-- ---------------------------------------------------------------------------
-- Kategori multi-kolom: Agama, Golongan Darah, Pekerjaan, Pendidikan,
-- Status Kawin → JSON {Subkategori: nilai, ..., JML: total}.
-- ---------------------------------------------------------------------------
INSERT INTO m_demografi_wilayah (kategori, kode, wilayah, level, parent_kode, data, updated_at)
SELECT
  CASE d.`group`
    WHEN 'Agama'          THEN 'agama'
    WHEN 'Golongan Darah' THEN 'gol-darah'
    WHEN 'Pekerjaan'      THEN 'pekerjaan'
    WHEN 'Pendidikan'     THEN 'pendidikan'
    WHEN 'Status Kawin'   THEN 'status-kawin'
  END,
  CAST(d.kode AS CHAR),
  COALESCE(kel.nama_kel, kec.nama_kec, CAST(d.kode AS CHAR)),
  IF(LENGTH(d.kode) = 6, 4, 5),
  IF(LENGTH(d.kode) = 10, LEFT(CAST(d.kode AS CHAR), 6), NULL),
  JSON_SET(
    JSON_OBJECTAGG(d.name, CAST(d.value AS SIGNED)),
    '$.JML', CAST(SUM(d.value) AS SIGNED)
  ),
  NOW()
FROM saibatin_lama.m_maps_dapduks d
LEFT JOIN saibatin_lama.m_setup_kec kec ON kec.id = d.kode
LEFT JOIN saibatin_lama.m_setup_kel kel ON kel.no_kel = d.kode
WHERE d.tahun = @TAHUN AND d.semester = @SEMESTER
  AND LENGTH(d.kode) IN (6, 10)
  AND d.`group` IN ('Agama','Golongan Darah','Pekerjaan','Pendidikan','Status Kawin')
GROUP BY d.`group`, d.kode, kel.nama_kel, kec.nama_kec;

-- ---------------------------------------------------------------------------
-- jenis-kelamin: pivot 3 grup skalar → {L, P, JML}.
-- ---------------------------------------------------------------------------
INSERT INTO m_demografi_wilayah (kategori, kode, wilayah, level, parent_kode, data, updated_at)
SELECT
  'jenis-kelamin',
  CAST(d.kode AS CHAR),
  COALESCE(kel.nama_kel, kec.nama_kec, CAST(d.kode AS CHAR)),
  IF(LENGTH(d.kode) = 6, 4, 5),
  IF(LENGTH(d.kode) = 10, LEFT(CAST(d.kode AS CHAR), 6), NULL),
  JSON_OBJECT(
    'L',   CAST(SUM(IF(d.`group` = 'Penduduk Laki-Laki', d.value, 0)) AS SIGNED),
    'P',   CAST(SUM(IF(d.`group` = 'Penduduk Perempuan', d.value, 0)) AS SIGNED),
    'JML', CAST(SUM(IF(d.`group` = 'Penduduk',           d.value, 0)) AS SIGNED)
  ),
  NOW()
FROM saibatin_lama.m_maps_dapduks d
LEFT JOIN saibatin_lama.m_setup_kec kec ON kec.id = d.kode
LEFT JOIN saibatin_lama.m_setup_kel kel ON kel.no_kel = d.kode
WHERE d.tahun = @TAHUN AND d.semester = @SEMESTER
  AND LENGTH(d.kode) IN (6, 10)
  AND d.`group` IN ('Penduduk', 'Penduduk Laki-Laki', 'Penduduk Perempuan')
GROUP BY d.kode, kel.nama_kel, kec.nama_kec;

-- ---------------------------------------------------------------------------
-- kk & wajib-ktp: grup skalar (name = 'Total') → {JML}.
-- ---------------------------------------------------------------------------
INSERT INTO m_demografi_wilayah (kategori, kode, wilayah, level, parent_kode, data, updated_at)
SELECT
  IF(d.`group` = 'KK', 'kk', 'wajib-ktp'),
  CAST(d.kode AS CHAR),
  COALESCE(kel.nama_kel, kec.nama_kec, CAST(d.kode AS CHAR)),
  IF(LENGTH(d.kode) = 6, 4, 5),
  IF(LENGTH(d.kode) = 10, LEFT(CAST(d.kode AS CHAR), 6), NULL),
  JSON_OBJECT('JML', CAST(d.value AS SIGNED)),
  NOW()
FROM saibatin_lama.m_maps_dapduks d
LEFT JOIN saibatin_lama.m_setup_kec kec ON kec.id = d.kode
LEFT JOIN saibatin_lama.m_setup_kel kel ON kel.no_kel = d.kode
WHERE d.tahun = @TAHUN AND d.SEMESTER = @SEMESTER
  AND LENGTH(d.kode) IN (6, 10)
  AND d.`group` IN ('KK', 'Wajib KTP');
