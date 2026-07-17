-- ---------------------------------------------------------------------------
-- Migrasi PERMOHONAN LAYANAN dari DB portal lama (11 tabel t_* -> t_permohonan).
-- DIBUAT OLEH scripts-generator; payload = seluruh kolom data tabel asal
-- (kolom meta/administrasi dikecualikan), field NULL dibuang via JSON_MERGE_PATCH.
--
-- Sumber : saibatin_lama.t_kelahiran_1/2, t_kematian, t_kia, t_kedatangan,
--          t_konsolidasiupdatedata, t_kk_{tambahanak,pisahkk,numpang,
--          perubahanbiodata,cetakulang} â€” total 11.897 permohonan (2022-2025).
-- Target : t_permohonan (model Permohonan) + m_jenis_permohonan (kode).
--
-- PEMETAAN
-- * noregister = nomorPermohonan lama (unik lintas tabel, sudah diverifikasi).
-- * status: 0 Ditolak->DITOLAK, 1 Selesai->SELESAI, 2 Baru->MENUNGGU,
--           3 Dalam Proses & 4 Terkendala->DIPROSES (m_options.progressStatus).
-- * userId: created_by lama -> users lama.user_id -> users baru.id.
--   Yang tidak terpetakan (Â± 200) dimiliki akun arsip 'arsip-portal-lama'
--   (nonaktif, password invalid â€” tidak bisa login).
-- * catatan = catatan_admin lama (+ alasan penolakan bila ada).
-- * Kolom syaratDok_* TIDAK ikut payload â€” berkas lampiran dimigrasi terpisah
--   ke t_berkas oleh scripts/migrasi-berkas-db-lama.sql (jalankan SESUDAH
--   skrip ini, karena skrip ini mengosongkan t_permohonan + t_berkas).
--
-- Jalankan dari DB target (server: awali SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci):
--   mysql saibatin -e "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci; SOURCE scripts/migrasi-permohonan-db-lama.sql;"
--
-- PERHATIAN: menghapus SELURUH permohonan (data uji) + notifikasi permohonan
-- lama sebelum mengisi ulang. Migrasi = sumber kebenaran.
-- ---------------------------------------------------------------------------

-- Akun arsip untuk permohonan yang pemiliknya tak dikenal.
INSERT INTO users (user_id, password, userlevel_id, user_fullname, status, ket, created_at, updated_at)
SELECT 'arsip-portal-lama', '!arsip-tidak-bisa-login', 3, 'Arsip Portal Lama', 0,
       'Akun sistem: pemilik permohonan lama yang tidak terpetakan', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = 'arsip-portal-lama');

SET @ARSIP := (SELECT id FROM users WHERE user_id = 'arsip-portal-lama');

-- Bersihkan data uji.
DELETE FROM t_berkas WHERE permohonan_id IN (SELECT id FROM t_permohonan);
DELETE FROM t_permohonan;
DELETE FROM t_notifikasi WHERE ref_type = 'Permohonan';

-- ---------------------------------------------------------------- t_kelahiran_1
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'AKTA_KELAHIRAN_NIK_ADA'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'biodata_Kk', s.`biodata_Kk`,
      'biodata_anakNama', s.`biodata_anakNama`,
      'biodata_anakJenisKelamin', s.`biodata_anakJenisKelamin`,
      'biodata_anakTanggalLahir', s.`biodata_anakTanggalLahir`,
      'biodata_ayahNik', s.`biodata_ayahNik`,
      'biodata_ayahNama', s.`biodata_ayahNama`,
      'biodata_ayahPekerjaan', s.`biodata_ayahPekerjaan`,
      'biodata_ibuNik', s.`biodata_ibuNik`,
      'biodata_ibuNama', s.`biodata_ibuNama`,
      'dataKelahiran_anakKe', s.`dataKelahiran_anakKe`,
      'dataKelahiran_tmptDilahirkan', s.`dataKelahiran_tmptDilahirkan`,
      'dataKelahiran_tmptKelahiran', s.`dataKelahiran_tmptKelahiran`,
      'dataKelahiran_jamKelahiran', s.`dataKelahiran_jamKelahiran`,
      'dataKelahiran_jenisKelahiran', s.`dataKelahiran_jenisKelahiran`,
      'dataKelahiran_berat', s.`dataKelahiran_berat`,
      'dataKelahiran_panjang', s.`dataKelahiran_panjang`,
      'dataKelahiran_penolong', s.`dataKelahiran_penolong`,
      'saksi1_nik', s.`saksi1_nik`,
      'saksi1_nama', s.`saksi1_nama`,
      'saksi2_nik', s.`saksi2_nik`,
      'saksi2_nama', s.`saksi2_nama`,
      'pengambilanDok_tmptSerahDanAmbil', s.`pengambilanDok_tmptSerahDanAmbil`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kelahiran_1 s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_kelahiran_2
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'AKTA_KELAHIRAN_NIK_BLM_ADA'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'biodata_anakNik', s.`biodata_anakNik`,
      'biodata_Kk', s.`biodata_Kk`,
      'biodata_anakNama', s.`biodata_anakNama`,
      'biodata_anakJenisKelamin', s.`biodata_anakJenisKelamin`,
      'biodata_anakTanggalLahir', s.`biodata_anakTanggalLahir`,
      'biodata_ayahNik', s.`biodata_ayahNik`,
      'biodata_ayahNama', s.`biodata_ayahNama`,
      'biodata_ayahPekerjaan', s.`biodata_ayahPekerjaan`,
      'biodata_ibuNik', s.`biodata_ibuNik`,
      'biodata_ibuNama', s.`biodata_ibuNama`,
      'dataKelahiran_anakKe', s.`dataKelahiran_anakKe`,
      'dataKelahiran_tmptDilahirkan', s.`dataKelahiran_tmptDilahirkan`,
      'dataKelahiran_tmptKelahiran', s.`dataKelahiran_tmptKelahiran`,
      'dataKelahiran_jamKelahiran', s.`dataKelahiran_jamKelahiran`,
      'dataKelahiran_jenisKelahiran', s.`dataKelahiran_jenisKelahiran`,
      'dataKelahiran_berat', s.`dataKelahiran_berat`,
      'dataKelahiran_panjang', s.`dataKelahiran_panjang`,
      'dataKelahiran_penolong', s.`dataKelahiran_penolong`,
      'saksi1_nik', s.`saksi1_nik`,
      'saksi1_nama', s.`saksi1_nama`,
      'saksi2_nik', s.`saksi2_nik`,
      'saksi2_nama', s.`saksi2_nama`,
      'pengambilanDok_tmptSerahDanAmbil', s.`pengambilanDok_tmptSerahDanAmbil`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kelahiran_2 s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_kematian
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'AKTA_KEMATIAN'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'biodata_Kk', s.`biodata_Kk`,
      'biodata_jenazahNik', s.`biodata_jenazahNik`,
      'biodata_jenazahNama', s.`biodata_jenazahNama`,
      'biodata_jenazahJenisKelamin', s.`biodata_jenazahJenisKelamin`,
      'biodata_jenazahTanggalLahir', s.`biodata_jenazahTanggalLahir`,
      'biodata_ayahNik', s.`biodata_ayahNik`,
      'biodata_ayahNama', s.`biodata_ayahNama`,
      'biodata_ayahPekerjaan', s.`biodata_ayahPekerjaan`,
      'biodata_ibuNik', s.`biodata_ibuNik`,
      'biodata_ibuNama', s.`biodata_ibuNama`,
      'dataKematian_anakKe', s.`dataKematian_anakKe`,
      'dataKematian_tanggalKematian', s.`dataKematian_tanggalKematian`,
      'dataKematian_jamKematian', s.`dataKematian_jamKematian`,
      'dataKematian_tmptKematian', s.`dataKematian_tmptKematian`,
      'dataKematian_sebabKematian', s.`dataKematian_sebabKematian`,
      'dataKematian_menerangkanKematian', s.`dataKematian_menerangkanKematian`,
      'saksi1_nik', s.`saksi1_nik`,
      'saksi1_nama', s.`saksi1_nama`,
      'saksi2_nik', s.`saksi2_nik`,
      'saksi2_nama', s.`saksi2_nama`,
      'pengambilanDok_tmptSerahDanAmbil', s.`pengambilanDok_tmptSerahDanAmbil`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kematian s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_kia
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'KIA'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'biodata_Kk', s.`biodata_Kk`,
      'biodata_anakNik', s.`biodata_anakNik`,
      'biodata_anakNama', s.`biodata_anakNama`,
      'biodata_anakJenisKelamin', s.`biodata_anakJenisKelamin`,
      'biodata_anakTanggalLahir', s.`biodata_anakTanggalLahir`,
      'biodata_anakTempatLahir', s.`biodata_anakTempatLahir`,
      'biodata_ayahNik', s.`biodata_ayahNik`,
      'biodata_ayahNama', s.`biodata_ayahNama`,
      'biodata_ibuNik', s.`biodata_ibuNik`,
      'biodata_ibuNama', s.`biodata_ibuNama`,
      'pengambilanDok_tmptSerahDanAmbil', s.`pengambilanDok_tmptSerahDanAmbil`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kia s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_kedatangan
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'KEDATANGAN'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'biodata_Kk', s.`biodata_Kk`,
      'biodata_Nik', s.`biodata_Nik`,
      'dataKedatangan_skpwni', s.`dataKedatangan_skpwni`,
      'dataKedatangan_namaPemohon', s.`dataKedatangan_namaPemohon`,
      'dataKedatangan_nikPemohon', s.`dataKedatangan_nikPemohon`,
      'dataKedatangan_noHp', s.`dataKedatangan_noHp`,
      'dataKedatangan_email', s.`dataKedatangan_email`,
      'dataKedatangan_kecamatanTujuan', s.`dataKedatangan_kecamatanTujuan`,
      'dataKedatangan_desaTujuan', s.`dataKedatangan_desaTujuan`,
      'dataKedatangan_dusunTujuan', s.`dataKedatangan_dusunTujuan`,
      'dataKedatangan_catatan', s.`dataKedatangan_catatan`,
      'pengambilanDok_tmptSerahDanAmbil', s.`pengambilanDok_tmptSerahDanAmbil`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kedatangan s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_konsolidasiupdatedata
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'KONSOLIDASI'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'dataKonsolidasi_namakepalakeluarga', s.`dataKonsolidasi_namakepalakeluarga`,
      'dataKonsolidasi_alasankonsolidasidata', s.`dataKonsolidasi_alasankonsolidasidata`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_konsolidasiupdatedata s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_kk_tambahanak
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'KK_TAMBAH_ANAK'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'kk_namaanggotakeluarga', s.`kk_namaanggotakeluarga`,
      'kk_tempatlahir', s.`kk_tempatlahir`,
      'kk_tanggallahir', s.`kk_tanggallahir`,
      'kk_jeniskelamin', s.`kk_jeniskelamin`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kk_tambahanak s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_kk_pisahkk
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'KK_PISAH'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'kk_jenispisah', s.`kk_jenispisah`,
      'kk_nikygpisah', s.`kk_nikygpisah`,
      'kk_alasanpisah', s.`kk_alasanpisah`,
      'kk_nikpasangan', s.`kk_nikpasangan`,
      'kk_kecamatantujuan', s.`kk_kecamatantujuan`,
      'kk_kelurahantujuan', s.`kk_kelurahantujuan`,
      'kk_norwtujuan', s.`kk_norwtujuan`,
      'kk_norttujuan', s.`kk_norttujuan`,
      'kk_alamattujuan', s.`kk_alamattujuan`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kk_pisahkk s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_kk_numpang
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'KK_NUMPANG'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'kk_kklama', s.`kk_kklama`,
      'kk_kkygditempati', s.`kk_kkygditempati`,
      'kk_nikygnumpangkk', s.`kk_nikygnumpangkk`,
      'kk_alasannumpangkk', s.`kk_alasannumpangkk`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kk_numpang s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_kk_perubahanbiodata
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'KK_UBAH_BIODATA'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'kk_kk', s.`kk_kk`,
      'kk_nik', s.`kk_nik`,
      'kk_jenisbiodata', s.`kk_jenisbiodata`,
      'kk_nama', s.`kk_nama`,
      'kk_jeniskelamin', s.`kk_jeniskelamin`,
      'kk_tempatlahir', s.`kk_tempatlahir`,
      'kk_tanggallahir', s.`kk_tanggallahir`,
      'kk_golongandarah', s.`kk_golongandarah`,
      'kk_agama', s.`kk_agama`,
      'kk_pendidikan', s.`kk_pendidikan`,
      'kk_pekerjaan', s.`kk_pekerjaan`,
      'kk_namaayah', s.`kk_namaayah`,
      'kk_namaibu', s.`kk_namaibu`,
      'kk_statusperkawinan', s.`kk_statusperkawinan`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kk_perubahanbiodata s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;

-- ---------------------------------------------------------------- t_kk_cetakulang
INSERT INTO t_permohonan (no_register, user_id, jenis_id, status, payload, catatan, created_at, updated_at)
SELECT
  s.nomorPermohonan,
  COALESCE(nu.id, @ARSIP),
  (SELECT j.id FROM m_jenis_permohonan j WHERE j.kode = 'KK_CETAK_ULANG'),
  CASE s.progress_status WHEN 0 THEN 'DITOLAK' WHEN 1 THEN 'SELESAI'
                         WHEN 2 THEN 'MENUNGGU' ELSE 'DIPROSES' END,
  JSON_MERGE_PATCH('{}', JSON_OBJECT(
      'pemohon_hp', s.`pemohon_hp`,
      'pemohon_email', s.`pemohon_email`,
      'pemohon_nik', s.`pemohon_nik`,
      'pemohon_nama', s.`pemohon_nama`,
      'pemohon_kk', s.`pemohon_kk`,
      'kk_namakepalakeluarga', s.`kk_namakepalakeluarga`,
      'kk_alasancetakulang', s.`kk_alasancetakulang`,
      'kk_alamatkepalakeluarga', s.`kk_alamatkepalakeluarga`,
      'catatan_detail', s.`catatan_detail`
  )),
  NULLIF(CONCAT_WS(' | ', s.catatan_admin, s.alasan_detail), ''),
  COALESCE(s.created_at, NOW(3)),
  COALESCE(s.updated_at, s.created_at, NOW(3))
FROM saibatin_lama.t_kk_cetakulang s
LEFT JOIN saibatin_lama.users ol ON ol.id = s.created_by
LEFT JOIN users nu ON nu.user_id = ol.user_id
WHERE s.nomorPermohonan IS NOT NULL;
