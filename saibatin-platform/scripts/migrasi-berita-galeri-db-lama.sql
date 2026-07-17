-- ---------------------------------------------------------------------------
-- Migrasi BERITA + GALERI dari DB portal lama (`saibatin_lama`) ke tabel baru.
--
-- Sumber : m_news_posts + m_news_images + m_news_category + users (lama),
--          m_galleries (lama).
-- Target : m_news_posts (model News) & t_galleries (model Gallery) di DB app.
--
-- PRASYARAT: file gambar lama sudah disalin ke `public/uploads/berita/` dan
-- `public/uploads/gallery/` (nama file = bagian akhir path lama; sumber
-- `public_html/img/{berita,gallery}` di server lama / URL situs lama).
--
-- Jalankan dari DB target:
--   mysql -u root saibatin < scripts/migrasi-berita-galeri-db-lama.sql
--
-- PERHATIAN: mengganti SELURUH isi tabel berita & galeri (data seed/dummy
-- dibuang; migrasi = sumber kebenaran).
-- ---------------------------------------------------------------------------

DELETE FROM m_news_posts;
DELETE FROM t_galleries;

-- ---------------------------------------------------------------------------
-- Berita. Slug dibentuk dari judul + id lama agar pasti unik. Ringkasan =
-- konten tanpa tag HTML, dipotong 200 karakter. Penulis = nama lengkap user
-- lama (created_by). Kategori lama semuanya "berita".
-- ---------------------------------------------------------------------------
INSERT INTO m_news_posts
  (judul, slug, kategori, ringkasan, konten, gambar, penulis, publish, created_at, updated_at)
SELECT
  TRIM(REGEXP_REPLACE(p.news_post_title, '[[:space:]]+', ' ')),
  CONCAT(
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(p.news_post_title), '[^a-z0-9]+', '-')),
    '-', p.id
  ),
  'Berita',
  LEFT(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(
    REPLACE(COALESCE(p.news_post_content, ''), '&nbsp;', ' '),
    '<[^>]*>', ' '), '[[:space:]]+', ' ')), 200),
  COALESCE(p.news_post_content, ''),
  IF(i.news_images_path IS NULL, NULL,
     CONCAT('/uploads/berita/', SUBSTRING_INDEX(i.news_images_path, '/', -1))),
  u.user_fullname,
  p.status = 1,
  COALESCE(p.created_at, NOW()),
  COALESCE(p.updated_at, p.created_at, NOW())
FROM saibatin_lama.m_news_posts p
LEFT JOIN saibatin_lama.m_news_images i ON i.news_posts_id = p.id
LEFT JOIN saibatin_lama.users u ON u.id = p.created_by;

-- ---------------------------------------------------------------------------
-- Galeri. Kolom `galleries_filename` lama berisi judul tampilan. Semua
-- kategori lama = "pelayanan" → 'PELAYANAN' (enum app baru).
-- ---------------------------------------------------------------------------
INSERT INTO t_galleries (judul, kategori, gambar, deskripsi, created_at)
SELECT
  COALESCE(NULLIF(TRIM(g.galleries_filename), ''), SUBSTRING_INDEX(g.galleries_path, '/', -1)),
  'PELAYANAN',
  CONCAT('/uploads/gallery/', SUBSTRING_INDEX(g.galleries_path, '/', -1)),
  NULL,
  COALESCE(g.created_at, NOW())
FROM saibatin_lama.m_galleries g
WHERE g.status = 1 AND g.galleries_path IS NOT NULL AND g.galleries_path <> '';
