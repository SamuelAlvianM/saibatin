-- ---------------------------------------------------------------------------
-- Migrasi PENGADUAN MASYARAKAT dari DB portal lama.
--
-- Sumber : saibatin_lama.t_pengaduanmasyarakat (4 baris)
-- Target : saibatin.t_pengaduanmasyarakat (model Pengaduan)
--
-- Jalankan dari DB target:
--   mysql -u root saibatin < scripts/migrasi-pengaduan-db-lama.sql
--
-- CATATAN
-- 1. Hanya 2 aduan ASLI yang dibawa. Dilewati:
--      id 2 — data uji coba ("Judul Testing 30/03/2024")
--      id 4 — duplikat id 3 (judul & nomor HP sama persis, dikirim ulang)
-- 2. Portal lama TIDAK menyimpan nama pelapor (created_by=99 menunjuk user yang
--    tidak ada di tabel users), sedangkan kolom `nama` wajib diisi — maka diisi
--    penanda eksplisit, bukan nama karangan.
-- 3. `aduan_lokasi` tidak punya kolom padanan; digabung ke akhir `isi` supaya
--    informasinya tidak hilang.
-- 4. progress_status lama: 1 = sudah ditangani → SELESAI, 0 → BARU.
-- 5. Kolom `skm_key` (hash) tidak dibawa — tidak dipakai app baru.
-- ---------------------------------------------------------------------------

INSERT INTO t_pengaduanmasyarakat
  (nama, nik, email, hp, subjek, isi, status, balasan, created_at, updated_at)
SELECT
  '(nama tidak tercatat di portal lama)',
  NULL,
  NULL,
  NULLIF(TRIM(COALESCE(p.aduan_telp, '')), ''),
  LEFT(TRIM(p.aduan_judul), 191),
  CONCAT(
    TRIM(COALESCE(p.aduan_isi, '')),
    IF(NULLIF(TRIM(COALESCE(p.aduan_lokasi, '')), '') IS NULL, '',
       CONCAT('\n\nLokasi: ', TRIM(p.aduan_lokasi))),
    '\n\n[Migrasi portal lama — no. permohonan ', COALESCE(p.nomorPermohonan, '-'), ']'
  ),
  IF(p.progress_status = 1, 'SELESAI', 'BARU'),
  NULLIF(TRIM(COALESCE(p.catatan_admin, '')), ''),
  COALESCE(p.created_at, NOW()),
  COALESCE(p.updated_at, p.created_at, NOW())
FROM saibatin_lama.t_pengaduanmasyarakat p
WHERE p.id IN (3, 5);
