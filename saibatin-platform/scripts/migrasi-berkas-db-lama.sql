-- ---------------------------------------------------------------------------
-- Migrasi BERKAS LAMPIRAN permohonan lama -> t_berkas. DIBUAT OLEH generator.
--
-- Sumber : kolom syaratDok_* pada 11 tabel layanan saibatin_lama (1.456 file).
-- Target : t_berkas (relasi ke t_permohonan via no_register lama).
--
-- PRASYARAT
-- 1. scripts/migrasi-permohonan-db-lama.sql SUDAH dijalankan (skrip itu
--    mengosongkan t_permohonan + t_berkas; jalankan skrip ini SETELAHNYA).
-- 2. File fisik disalin ke public/uploads/<layanan>/<noregister>/... â€”
--    path DB lama dipakai apa adanya, diawali '/'. File adalah DOKUMEN PRIBADI
--    warga: JANGAN di-commit ke git (folder-folder ini masuk .gitignore);
--    transfer ke server via scp/tar terpisah.
--
-- Jalankan dari DB target (server: awali SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci):
--   mysql saibatin -e "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci; SOURCE scripts/migrasi-berkas-db-lama.sql;"
-- ---------------------------------------------------------------------------

INSERT INTO t_berkas (permohonan_id, nama_file, path, mime_type, created_at)
SELECT
  p.id,
  b.label,
  CONCAT('/', b.path),
  CASE LOWER(SUBSTRING_INDEX(b.path, '.', -1))
    WHEN 'jpg' THEN 'image/jpeg' WHEN 'jpeg' THEN 'image/jpeg'
    WHEN 'png' THEN 'image/png'  WHEN 'pdf'  THEN 'application/pdf'
    ELSE NULL END,
  COALESCE(p.created_at, NOW(3))
FROM (
  SELECT nomorPermohonan nr, 'bukuNikah' label, `syaratDok_bukuNikah` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_bukuNikah` IS NOT NULL AND `syaratDok_bukuNikah` <> '' AND `syaratDok_bukuNikah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KK' label, `syaratDok_KK` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_KK` IS NOT NULL AND `syaratDok_KK` <> '' AND `syaratDok_KK` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'keteranganLahir' label, `syaratDok_keteranganLahir` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_keteranganLahir` IS NOT NULL AND `syaratDok_keteranganLahir` <> '' AND `syaratDok_keteranganLahir` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'ktpsaksi1' label, `syaratDok_ktpsaksi1` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_ktpsaksi1` IS NOT NULL AND `syaratDok_ktpsaksi1` <> '' AND `syaratDok_ktpsaksi1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'ktpsaksi2' label, `syaratDok_ktpsaksi2` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_ktpsaksi2` IS NOT NULL AND `syaratDok_ktpsaksi2` <> '' AND `syaratDok_ktpsaksi2` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'ktpayah' label, `syaratDok_ktpayah` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_ktpayah` IS NOT NULL AND `syaratDok_ktpayah` <> '' AND `syaratDok_ktpayah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'ktpibu' label, `syaratDok_ktpibu` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_ktpibu` IS NOT NULL AND `syaratDok_ktpibu` <> '' AND `syaratDok_ktpibu` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung1' label, `syaratDok_pendukung1` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_pendukung1` IS NOT NULL AND `syaratDok_pendukung1` <> '' AND `syaratDok_pendukung1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung2' label, `syaratDok_pendukung2` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_pendukung2` IS NOT NULL AND `syaratDok_pendukung2` <> '' AND `syaratDok_pendukung2` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung3' label, `syaratDok_pendukung3` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_pendukung3` IS NOT NULL AND `syaratDok_pendukung3` <> '' AND `syaratDok_pendukung3` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung4' label, `syaratDok_pendukung4` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_pendukung4` IS NOT NULL AND `syaratDok_pendukung4` <> '' AND `syaratDok_pendukung4` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung5' label, `syaratDok_pendukung5` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_pendukung5` IS NOT NULL AND `syaratDok_pendukung5` <> '' AND `syaratDok_pendukung5` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung6' label, `syaratDok_pendukung6` path FROM saibatin_lama.t_kelahiran_1 WHERE `syaratDok_pendukung6` IS NOT NULL AND `syaratDok_pendukung6` <> '' AND `syaratDok_pendukung6` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'bukuNikah' label, `syaratDok_bukuNikah` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_bukuNikah` IS NOT NULL AND `syaratDok_bukuNikah` <> '' AND `syaratDok_bukuNikah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KK' label, `syaratDok_KK` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_KK` IS NOT NULL AND `syaratDok_KK` <> '' AND `syaratDok_KK` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'keteranganLahir' label, `syaratDok_keteranganLahir` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_keteranganLahir` IS NOT NULL AND `syaratDok_keteranganLahir` <> '' AND `syaratDok_keteranganLahir` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'ktpsaksi1' label, `syaratDok_ktpsaksi1` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_ktpsaksi1` IS NOT NULL AND `syaratDok_ktpsaksi1` <> '' AND `syaratDok_ktpsaksi1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'ktpsaksi2' label, `syaratDok_ktpsaksi2` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_ktpsaksi2` IS NOT NULL AND `syaratDok_ktpsaksi2` <> '' AND `syaratDok_ktpsaksi2` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'ktpayah' label, `syaratDok_ktpayah` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_ktpayah` IS NOT NULL AND `syaratDok_ktpayah` <> '' AND `syaratDok_ktpayah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'ktpibu' label, `syaratDok_ktpibu` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_ktpibu` IS NOT NULL AND `syaratDok_ktpibu` <> '' AND `syaratDok_ktpibu` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung1' label, `syaratDok_pendukung1` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_pendukung1` IS NOT NULL AND `syaratDok_pendukung1` <> '' AND `syaratDok_pendukung1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung2' label, `syaratDok_pendukung2` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_pendukung2` IS NOT NULL AND `syaratDok_pendukung2` <> '' AND `syaratDok_pendukung2` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung3' label, `syaratDok_pendukung3` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_pendukung3` IS NOT NULL AND `syaratDok_pendukung3` <> '' AND `syaratDok_pendukung3` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung4' label, `syaratDok_pendukung4` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_pendukung4` IS NOT NULL AND `syaratDok_pendukung4` <> '' AND `syaratDok_pendukung4` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung5' label, `syaratDok_pendukung5` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_pendukung5` IS NOT NULL AND `syaratDok_pendukung5` <> '' AND `syaratDok_pendukung5` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung6' label, `syaratDok_pendukung6` path FROM saibatin_lama.t_kelahiran_2 WHERE `syaratDok_pendukung6` IS NOT NULL AND `syaratDok_pendukung6` <> '' AND `syaratDok_pendukung6` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'keteranganKematian' label, `syaratDok_keteranganKematian` path FROM saibatin_lama.t_kematian WHERE `syaratDok_keteranganKematian` IS NOT NULL AND `syaratDok_keteranganKematian` <> '' AND `syaratDok_keteranganKematian` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KK' label, `syaratDok_KK` path FROM saibatin_lama.t_kematian WHERE `syaratDok_KK` IS NOT NULL AND `syaratDok_KK` <> '' AND `syaratDok_KK` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KTPPelapor' label, `syaratDok_KTPPelapor` path FROM saibatin_lama.t_kematian WHERE `syaratDok_KTPPelapor` IS NOT NULL AND `syaratDok_KTPPelapor` <> '' AND `syaratDok_KTPPelapor` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KTPJenazah' label, `syaratDok_KTPJenazah` path FROM saibatin_lama.t_kematian WHERE `syaratDok_KTPJenazah` IS NOT NULL AND `syaratDok_KTPJenazah` <> '' AND `syaratDok_KTPJenazah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung1' label, `syaratDok_pendukung1` path FROM saibatin_lama.t_kematian WHERE `syaratDok_pendukung1` IS NOT NULL AND `syaratDok_pendukung1` <> '' AND `syaratDok_pendukung1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung2' label, `syaratDok_pendukung2` path FROM saibatin_lama.t_kematian WHERE `syaratDok_pendukung2` IS NOT NULL AND `syaratDok_pendukung2` <> '' AND `syaratDok_pendukung2` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung3' label, `syaratDok_pendukung3` path FROM saibatin_lama.t_kematian WHERE `syaratDok_pendukung3` IS NOT NULL AND `syaratDok_pendukung3` <> '' AND `syaratDok_pendukung3` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung4' label, `syaratDok_pendukung4` path FROM saibatin_lama.t_kematian WHERE `syaratDok_pendukung4` IS NOT NULL AND `syaratDok_pendukung4` <> '' AND `syaratDok_pendukung4` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung5' label, `syaratDok_pendukung5` path FROM saibatin_lama.t_kematian WHERE `syaratDok_pendukung5` IS NOT NULL AND `syaratDok_pendukung5` <> '' AND `syaratDok_pendukung5` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung6' label, `syaratDok_pendukung6` path FROM saibatin_lama.t_kematian WHERE `syaratDok_pendukung6` IS NOT NULL AND `syaratDok_pendukung6` <> '' AND `syaratDok_pendukung6` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'aktaKelahiran' label, `syaratDok_aktaKelahiran` path FROM saibatin_lama.t_kia WHERE `syaratDok_aktaKelahiran` IS NOT NULL AND `syaratDok_aktaKelahiran` <> '' AND `syaratDok_aktaKelahiran` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KK' label, `syaratDok_KK` path FROM saibatin_lama.t_kia WHERE `syaratDok_KK` IS NOT NULL AND `syaratDok_KK` <> '' AND `syaratDok_KK` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'PassFoto' label, `syaratDok_PassFoto` path FROM saibatin_lama.t_kia WHERE `syaratDok_PassFoto` IS NOT NULL AND `syaratDok_PassFoto` <> '' AND `syaratDok_PassFoto` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung1' label, `syaratDok_pendukung1` path FROM saibatin_lama.t_kia WHERE `syaratDok_pendukung1` IS NOT NULL AND `syaratDok_pendukung1` <> '' AND `syaratDok_pendukung1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung2' label, `syaratDok_pendukung2` path FROM saibatin_lama.t_kia WHERE `syaratDok_pendukung2` IS NOT NULL AND `syaratDok_pendukung2` <> '' AND `syaratDok_pendukung2` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung3' label, `syaratDok_pendukung3` path FROM saibatin_lama.t_kia WHERE `syaratDok_pendukung3` IS NOT NULL AND `syaratDok_pendukung3` <> '' AND `syaratDok_pendukung3` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung4' label, `syaratDok_pendukung4` path FROM saibatin_lama.t_kia WHERE `syaratDok_pendukung4` IS NOT NULL AND `syaratDok_pendukung4` <> '' AND `syaratDok_pendukung4` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung5' label, `syaratDok_pendukung5` path FROM saibatin_lama.t_kia WHERE `syaratDok_pendukung5` IS NOT NULL AND `syaratDok_pendukung5` <> '' AND `syaratDok_pendukung5` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung6' label, `syaratDok_pendukung6` path FROM saibatin_lama.t_kia WHERE `syaratDok_pendukung6` IS NOT NULL AND `syaratDok_pendukung6` <> '' AND `syaratDok_pendukung6` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'suratPindah' label, `syaratDok_suratPindah` path FROM saibatin_lama.t_kedatangan WHERE `syaratDok_suratPindah` IS NOT NULL AND `syaratDok_suratPindah` <> '' AND `syaratDok_suratPindah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'bukunikah' label, `syaratDok_bukunikah` path FROM saibatin_lama.t_kedatangan WHERE `syaratDok_bukunikah` IS NOT NULL AND `syaratDok_bukunikah` <> '' AND `syaratDok_bukunikah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung1' label, `syaratDok_pendukung1` path FROM saibatin_lama.t_kedatangan WHERE `syaratDok_pendukung1` IS NOT NULL AND `syaratDok_pendukung1` <> '' AND `syaratDok_pendukung1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung2' label, `syaratDok_pendukung2` path FROM saibatin_lama.t_kedatangan WHERE `syaratDok_pendukung2` IS NOT NULL AND `syaratDok_pendukung2` <> '' AND `syaratDok_pendukung2` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung3' label, `syaratDok_pendukung3` path FROM saibatin_lama.t_kedatangan WHERE `syaratDok_pendukung3` IS NOT NULL AND `syaratDok_pendukung3` <> '' AND `syaratDok_pendukung3` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung4' label, `syaratDok_pendukung4` path FROM saibatin_lama.t_kedatangan WHERE `syaratDok_pendukung4` IS NOT NULL AND `syaratDok_pendukung4` <> '' AND `syaratDok_pendukung4` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung5' label, `syaratDok_pendukung5` path FROM saibatin_lama.t_kedatangan WHERE `syaratDok_pendukung5` IS NOT NULL AND `syaratDok_pendukung5` <> '' AND `syaratDok_pendukung5` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung6' label, `syaratDok_pendukung6` path FROM saibatin_lama.t_kedatangan WHERE `syaratDok_pendukung6` IS NOT NULL AND `syaratDok_pendukung6` <> '' AND `syaratDok_pendukung6` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung7' label, `syaratDok_pendukung7` path FROM saibatin_lama.t_kedatangan WHERE `syaratDok_pendukung7` IS NOT NULL AND `syaratDok_pendukung7` <> '' AND `syaratDok_pendukung7` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KTP' label, `syaratDok_KTP` path FROM saibatin_lama.t_konsolidasiupdatedata WHERE `syaratDok_KTP` IS NOT NULL AND `syaratDok_KTP` <> '' AND `syaratDok_KTP` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KK' label, `syaratDok_KK` path FROM saibatin_lama.t_konsolidasiupdatedata WHERE `syaratDok_KK` IS NOT NULL AND `syaratDok_KK` <> '' AND `syaratDok_KK` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'pendukung1' label, `syaratDok_pendukung1` path FROM saibatin_lama.t_konsolidasiupdatedata WHERE `syaratDok_pendukung1` IS NOT NULL AND `syaratDok_pendukung1` <> '' AND `syaratDok_pendukung1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KK' label, `syaratDok_KK` path FROM saibatin_lama.t_kk_tambahanak WHERE `syaratDok_KK` IS NOT NULL AND `syaratDok_KK` <> '' AND `syaratDok_KK` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'Akta' label, `syaratDok_Akta` path FROM saibatin_lama.t_kk_tambahanak WHERE `syaratDok_Akta` IS NOT NULL AND `syaratDok_Akta` <> '' AND `syaratDok_Akta` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'Bukunikah' label, `syaratDok_Bukunikah` path FROM saibatin_lama.t_kk_tambahanak WHERE `syaratDok_Bukunikah` IS NOT NULL AND `syaratDok_Bukunikah` <> '' AND `syaratDok_Bukunikah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KK' label, `syaratDok_KK` path FROM saibatin_lama.t_kk_pisahkk WHERE `syaratDok_KK` IS NOT NULL AND `syaratDok_KK` <> '' AND `syaratDok_KK` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KKPasangan' label, `syaratDok_KKPasangan` path FROM saibatin_lama.t_kk_pisahkk WHERE `syaratDok_KKPasangan` IS NOT NULL AND `syaratDok_KKPasangan` <> '' AND `syaratDok_KKPasangan` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'BukuNikah' label, `syaratDok_BukuNikah` path FROM saibatin_lama.t_kk_pisahkk WHERE `syaratDok_BukuNikah` IS NOT NULL AND `syaratDok_BukuNikah` <> '' AND `syaratDok_BukuNikah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'SuratCerai' label, `syaratDok_SuratCerai` path FROM saibatin_lama.t_kk_pisahkk WHERE `syaratDok_SuratCerai` IS NOT NULL AND `syaratDok_SuratCerai` <> '' AND `syaratDok_SuratCerai` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'AktaMati' label, `syaratDok_AktaMati` path FROM saibatin_lama.t_kk_pisahkk WHERE `syaratDok_AktaMati` IS NOT NULL AND `syaratDok_AktaMati` <> '' AND `syaratDok_AktaMati` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KKLama' label, `syaratDok_KKLama` path FROM saibatin_lama.t_kk_numpang WHERE `syaratDok_KKLama` IS NOT NULL AND `syaratDok_KKLama` <> '' AND `syaratDok_KKLama` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KKYgDitempati' label, `syaratDok_KKYgDitempati` path FROM saibatin_lama.t_kk_numpang WHERE `syaratDok_KKYgDitempati` IS NOT NULL AND `syaratDok_KKYgDitempati` <> '' AND `syaratDok_KKYgDitempati` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'Pendukung1' label, `syaratDok_Pendukung1` path FROM saibatin_lama.t_kk_numpang WHERE `syaratDok_Pendukung1` IS NOT NULL AND `syaratDok_Pendukung1` <> '' AND `syaratDok_Pendukung1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KK' label, `syaratDok_KK` path FROM saibatin_lama.t_kk_perubahanbiodata WHERE `syaratDok_KK` IS NOT NULL AND `syaratDok_KK` <> '' AND `syaratDok_KK` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'AktaLahir' label, `syaratDok_AktaLahir` path FROM saibatin_lama.t_kk_perubahanbiodata WHERE `syaratDok_AktaLahir` IS NOT NULL AND `syaratDok_AktaLahir` <> '' AND `syaratDok_AktaLahir` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'Ijazah' label, `syaratDok_Ijazah` path FROM saibatin_lama.t_kk_perubahanbiodata WHERE `syaratDok_Ijazah` IS NOT NULL AND `syaratDok_Ijazah` <> '' AND `syaratDok_Ijazah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'BukuNikah' label, `syaratDok_BukuNikah` path FROM saibatin_lama.t_kk_perubahanbiodata WHERE `syaratDok_BukuNikah` IS NOT NULL AND `syaratDok_BukuNikah` <> '' AND `syaratDok_BukuNikah` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'Pendukung1' label, `syaratDok_Pendukung1` path FROM saibatin_lama.t_kk_perubahanbiodata WHERE `syaratDok_Pendukung1` IS NOT NULL AND `syaratDok_Pendukung1` <> '' AND `syaratDok_Pendukung1` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'KK' label, `syaratDok_KK` path FROM saibatin_lama.t_kk_cetakulang WHERE `syaratDok_KK` IS NOT NULL AND `syaratDok_KK` <> '' AND `syaratDok_KK` LIKE 'uploads/%'
  UNION ALL
  SELECT nomorPermohonan nr, 'SuratKehilangan' label, `syaratDok_SuratKehilangan` path FROM saibatin_lama.t_kk_cetakulang WHERE `syaratDok_SuratKehilangan` IS NOT NULL AND `syaratDok_SuratKehilangan` <> '' AND `syaratDok_SuratKehilangan` LIKE 'uploads/%'
) b
-- CONVERT+COLLATE: tabel lama beragam collation (latin1/utf8mb4_general_ci)
-- sedangkan t_permohonan utf8mb4_unicode_ci.
JOIN t_permohonan p
  ON p.no_register = CONVERT(b.nr USING utf8mb4) COLLATE utf8mb4_unicode_ci;
