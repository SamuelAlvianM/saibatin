-- ---------------------------------------------------------------------------
-- Migrasi JAWABAN SKM dari DB portal lama.
--
-- Sumber : saibatin_lama.m_mediainformasi_skm_survey (203 jawaban warga)
-- Target : saibatin.t_skm_jawaban (model SkmJawaban)
--
-- Jalankan dari DB target:
--   mysql -u root saibatin < scripts/migrasi-skm-db-lama.sql
--
-- CATATAN PENTING
-- 1. Portal lama memakai 9 unsur & skala 1-4 (standar Permenpan 14/2017).
--    lib/skm.ts SUDAH disamakan ke standar itu, jadi nilai dibawa APA ADANYA
--    tanpa konversi — jangan diskalakan ke 1-5, indeksnya akan melenceng.
-- 2. Urutan unsur mengikuti kolom u0..u8 = indeks "0".."8" pada JSON `jawaban`,
--    sepadan dengan urutan SKM_ASPEK di lib/skm.ts (urut `sort` tabel
--    m_mediainformasi_skm_pertanyaan).
-- 3. Data seed/uji lama (Ani, Doni, Sari, Responden Uji) dibuang: nilainya
--    memakai skala 1-5 sehingga tidak sah pada skala baru.
-- 4. Jenis kelamin portal lama: 1 = Laki-laki, 0 = Perempuan (disimpulkan dari
--    nama responden — 1 seluruhnya nama laki-laki, 0 nama perempuan).
-- 5. Kode pekerjaan dipetakan lewat local_pkrjn_master.no -> descrip.
-- 6. Kolom whatsapp/email responden TIDAK dibawa: skema SkmJawaban tidak
--    menyediakannya dan survei tidak perlu menyimpan kontak pribadi.
-- 7. Tabel sumber ber-charset latin1, tabel target utf8mb4 — tiap kolom teks
--    WAJIB di-CONVERT, kalau tidak MySQL menolak dengan "Illegal mix of
--    collations".
-- ---------------------------------------------------------------------------

DELETE FROM t_skm_jawaban;

INSERT INTO t_skm_jawaban (nama, umur, jenis_kelamin, pekerjaan, jawaban, saran, created_at)
SELECT
  LEFT(NULLIF(TRIM(CONVERT(COALESCE(s.mediainformasiskmsurvey_nama, '') USING utf8mb4)), ''), 191),
  NULLIF(s.mediainformasiskmsurvey_usia, 0),
  CASE s.mediainformasiskmsurvey_jeniskelamin WHEN 1 THEN 'L' WHEN 0 THEN 'P' ELSE NULL END,
  LEFT(CONVERT(m.descrip USING utf8mb4), 191),
  JSON_OBJECT(
    '0', s.mediainformasiskmpertanyaan_u0,
    '1', s.mediainformasiskmpertanyaan_u1,
    '2', s.mediainformasiskmpertanyaan_u2,
    '3', s.mediainformasiskmpertanyaan_u3,
    '4', s.mediainformasiskmpertanyaan_u4,
    '5', s.mediainformasiskmpertanyaan_u5,
    '6', s.mediainformasiskmpertanyaan_u6,
    '7', s.mediainformasiskmpertanyaan_u7,
    '8', s.mediainformasiskmpertanyaan_u8
  ),
  NULLIF(TRIM(CONVERT(COALESCE(s.mediainformasiskmpertanyaan_saranmasukan, '') USING utf8mb4)), ''),
  COALESCE(s.created_at, NOW())
FROM saibatin_lama.m_mediainformasi_skm_survey s
LEFT JOIN saibatin_lama.local_pkrjn_master m
       ON m.no = s.mediainformasiskmsurvey_pekerjaan
-- hanya jawaban yang seluruh unsurnya terisi & masih di dalam skala 1-4
WHERE s.mediainformasiskmpertanyaan_u0 BETWEEN 1 AND 4
  AND s.mediainformasiskmpertanyaan_u1 BETWEEN 1 AND 4
  AND s.mediainformasiskmpertanyaan_u2 BETWEEN 1 AND 4
  AND s.mediainformasiskmpertanyaan_u3 BETWEEN 1 AND 4
  AND s.mediainformasiskmpertanyaan_u4 BETWEEN 1 AND 4
  AND s.mediainformasiskmpertanyaan_u5 BETWEEN 1 AND 4
  AND s.mediainformasiskmpertanyaan_u6 BETWEEN 1 AND 4
  AND s.mediainformasiskmpertanyaan_u7 BETWEEN 1 AND 4
  AND s.mediainformasiskmpertanyaan_u8 BETWEEN 1 AND 4;
