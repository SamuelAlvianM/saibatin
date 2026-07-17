-- ---------------------------------------------------------------------------
-- Migrasi USERS dari DB portal lama (`saibatin_lama`) ke tabel `users` app.
--
-- Sumber : saibatin_lama.users (1.480 baris, dump saibatinpesibar_db_pesbar_002)
-- Target : saibatin.users (model User)
--
-- Jalankan dari DB target:
--   mysql -u root saibatin < scripts/migrasi-users-db-lama.sql
--
-- CATATAN PENTING
-- 1. Password lama (hash bcrypt `$2y$`) dibawa APA ADANYA — bcryptjs di app
--    memverifikasi varian $2y$, jadi warga tetap bisa login pakai password lama.
-- 2. Kolom `passwordnote` portal lama menyimpan password PLAINTEXT untuk 374
--    akun. Kolom itu SENGAJA TIDAK diimport dan tidak punya padanan di skema
--    baru — jangan pernah dibawa masuk.
-- 3. Dedup: 1.480 baris → 1.378 user_id unik. NIK yang mendaftar berkali-kali
--    hanya diambil barisnya yang PALING BARU (id terbesar).
-- 4. Akun demo yang sudah ada (id 1–7) TIDAK disentuh; user lama masuk dengan
--    id baru (auto increment) supaya relasi permohonan/tiket/notifikasi yang
--    sudah ada tidak rusak. `created_by`/`updated_by` lama dibuang karena
--    menunjuk id lama yang tidak lagi berlaku.
-- 5. Pemetaan level (legacy m_userlevels → level app):
--      2 'operator capil' → 1 Super Admin   (mereka pengelola SELURUH konten
--                                            portal lama: berita, galeri, produk)
--      3 'masyarakat'     → 3 Warga
--      4 'developer'      → 2 Operator      (murni operasional, tak pernah
--                                            mengunggah konten)
--     41 (operator pekon) → 4 Operator OPD  (136 akun, tidak ada di
--                                            m_userlevels lama)
-- ---------------------------------------------------------------------------

INSERT INTO saibatin.users (
  user_id, password, userlevel_id, user_fullname, user_nik, user_nokk,
  user_hp, user_email, activation_code, activation_code_url, activation_time,
  forgotten_code, forgotten_time, login_last, ip_address, status, ket,
  email_verified_at, remember_token, created_by, created_at, updated_by, updated_at
)
SELECT
  l.user_id,
  l.password,
  CASE l.userlevel_id
    WHEN 2  THEN 1
    WHEN 3  THEN 3
    WHEN 4  THEN 2
    WHEN 41 THEN 4
    ELSE 3
  END,
  NULLIF(TRIM(COALESCE(l.user_fullname, '')), ''),
  NULLIF(TRIM(COALESCE(l.user_nik, '')), ''),
  NULLIF(TRIM(COALESCE(l.user_nokk, '')), ''),
  NULLIF(TRIM(COALESCE(l.user_hp, '')), ''),
  NULLIF(TRIM(COALESCE(l.user_email, '')), ''),
  NULLIF(TRIM(COALESCE(l.activation_code, '')), ''),
  l.activation_code_url,
  l.activation_time,
  NULLIF(TRIM(COALESCE(l.forgotten_code, '')), ''),
  l.forgotten_time,
  l.login_last,
  NULLIF(TRIM(COALESCE(l.ip_address, '')), ''),
  COALESCE(l.status, 0),
  l.ket,
  l.email_verified_at,
  l.remember_token,
  NULL,
  COALESCE(l.created_at, NOW()),
  NULL,
  COALESCE(l.updated_at, l.created_at, NOW())
FROM saibatin_lama.users l
-- dedup: hanya baris ter-baru untuk tiap user_id
JOIN (
  SELECT user_id, MAX(id) AS max_id
  FROM saibatin_lama.users
  GROUP BY user_id
) d ON d.max_id = l.id
-- jangan tabrakan dengan akun demo/bawaan yang sudah ada
WHERE NOT EXISTS (
  SELECT 1 FROM saibatin.users t WHERE t.user_id = l.user_id
);
