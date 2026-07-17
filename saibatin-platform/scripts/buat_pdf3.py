"""Bagian ketiga: bab tambahan agar panduan SAIBATIN lebih rinci daripada panduan KTT."""
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak

from buat_pdf import P, gambar, tabel


def isi_tambahan_publik():
    """Disisipkan di bab 4 — halaman publik yang belum terdokumentasi."""
    el = []
    el.append(P("4.9 Berita &amp; Galeri", "h2"))
    el.append(P(
        "<b>/media/berita</b> menampilkan 67 berita hasil migrasi portal lama, lengkap dengan "
        "gambar sampul, penulis, dan tanggal terbit. Isi berita dirender sebagai HTML berformat "
        "(judul, daftar, tautan, gambar). <b>/galeri</b> menampilkan 94 foto kegiatan dengan "
        "penyaring kategori."))
    el.extend(gambar("11-berita", "Berita — 67 artikel hasil migrasi portal lama beserta gambar sampulnya.", 14.5 * cm))
    el.extend(gambar("12-galeri", "Galeri — 94 foto kegiatan dengan penyaring kategori.", 14.5 * cm))

    el.append(P("4.10 Peta Kantor &amp; Jam Layanan", "h2"))
    el.append(P(
        "Peta memakai Leaflet dengan titik kantor Disdukcapil di Kompleks Perkantoran Pemda, Way "
        "Redak, Krui. Di sebelahnya tampil status jam layanan ala Google Maps: <i>Buka</i> / "
        "<i>Tutup</i> beserta jam tutup atau jam buka berikutnya, dihitung pada zona <b>WIB</b>. "
        "Jam layanan diatur petugas lewat drawer pengaturan di Dashboard → Pengajuan Baru."))
    el.extend(gambar("14-peta-kantor", "Peta Kantor — titik lokasi kantor dinas di Krui beserta status jam layanan (WIB).", 14.5 * cm))

    el.append(P("4.11 Produk Hukum &amp; SOP", "h2"))
    el.extend(gambar("18-produk-hukum", "Produk Hukum — 38 peraturan (UU, PP, Perpres, Permendagri, Kepmendagri, SE Dirjen Dukcapil).", 14.5 * cm))
    el.extend(gambar("19-produk-sop", "SOP — halaman siap menampung dokumen; berkas SOP resmi Pesisir Barat belum tersedia.", 14.5 * cm))

    el.append(P("4.12 PPID — Keterbukaan Informasi Publik", "h2"))
    el.append(P(
        "Menu PPID memuat Profil PPID, Informasi Wajib Tersedia Setiap Saat, dan Informasi Wajib "
        "Diumumkan Secara Berkala (amanat UU No. 14 Tahun 2008 tentang Keterbukaan Informasi "
        "Publik), serta halaman turunan seperti LHKPN, LKJIP, DPA, IKU, Renstra, Zona Integritas, "
        "dan Pengendalian Gratifikasi. Tiap halaman menampilkan berkas yang diunggah admin pada "
        "kategori dokumen yang bersesuaian."))
    el.extend(gambar("20-ppid-profil", "PPID — Profil PPID Disdukcapil Pesisir Barat.", 14.5 * cm))
    el.extend(gambar("23-ppid-lhkpn", "PPID — LHKPN; berkas diunggah lewat Dashboard → Dokumen Publikasi kategori LHKPN.", 14.5 * cm))

    el.append(P("4.13 Halaman WBS", "h2"))
    el.append(P(
        "Sejak menu WBS dilebur ke Pengaduan, kedua halaman berikut tetap dapat diakses langsung "
        "dan tercantum di peta situs, namun tidak lagi muncul sebagai menu tersendiri di navbar. "
        "Kanal pelaporan yang dianjurkan adalah <b>/pengaduan</b>."))
    el.extend(gambar("24-wbs-tentang", "Tentang WBS — penjelasan Whistle Blowing System Disdukcapil Pesisir Barat.", 14.5 * cm))

    el.append(P("4.14 Peta Situs &amp; Halaman Legal", "h2"))
    el.extend(gambar("26-sitemap", "Peta Situs — seluruh halaman portal dikelompokkan per menu.", 14.5 * cm))
    el.append(P(
        "Halaman <b>/privasi</b> memuat kebijakan privasi dan <b>/syarat</b> memuat syarat "
        "penggunaan. Halaman yang tidak ditemukan diarahkan ke tampilan 404 khas portal."))
    el.extend(gambar("29-not-found", "Halaman 404 — tampilan saat alamat tidak ditemukan.", 12.5 * cm))
    return el


def isi_tambahan_dashboard():
    """Disisipkan di bab 6 — menu dashboard yang belum terdokumentasi."""
    el = []
    el.append(P("6.8 Berita (Dashboard)", "h2"))
    el.append(P(
        "1. Buka <b>Dashboard → Berita</b> → klik <b>Tulis Berita</b>.<br/>"
        "2. Isi judul; slug dibuat otomatis dari judul dan dijamin unik.<br/>"
        "3. Tulis isi memakai editor berformat (tebal, miring, daftar, tautan, gambar).<br/>"
        "4. Pilih gambar sampul dari Pustaka Media atau unggah baru.<br/>"
        "5. Centang <b>Terbitkan</b> agar tampil di /media/berita; biarkan kosong untuk draf."))
    el.extend(gambar("35-berita-admin", "Dashboard → Berita — daftar berita beserta status terbit.", 14.5 * cm))

    el.append(P("6.9 Galeri &amp; Pustaka Media", "h2"))
    el.append(P(
        "<b>Galeri</b> mengelola foto kegiatan yang tampil di /galeri. <b>Pustaka Media</b> adalah "
        "penyimpanan berkas terpusat: berkas fisik disimpan di luar folder publik dan disajikan "
        "lewat rute khusus, sehingga petugas tidak pernah perlu mengetik URL — cukup memilih lewat "
        "pemilih berkas atau seret-lepas."))
    el.extend(gambar("36-galeri-admin", "Dashboard → Galeri — kelola 94 foto kegiatan.", 14.5 * cm))
    el.extend(gambar("37-media", "Dashboard → Pustaka Media — penyimpanan gambar/berkas terpusat.", 14.5 * cm))

    el.append(P("6.10 Pengaduan &amp; Kritik-Saran (Dashboard)", "h2"))
    el.append(P(
        "1. Buka <b>Dashboard → Pengaduan</b> — aduan baru menandai lonceng notifikasi.<br/>"
        "2. Klik aduan untuk membaca isinya beserta nomor kontak pelapor.<br/>"
        "3. Ubah status Baru → Diproses → Selesai, dan isi kolom balasan bila perlu.<br/>"
        "4. Untuk laporan yang bersifat WBS, jaga kerahasiaan identitas pelapor sesuai ketentuan."))
    el.extend(gambar("40-pengaduan-admin", "Dashboard → Pengaduan — antrian aduan masyarakat &amp; WBS.", 14.5 * cm))

    el.append(P("6.11 Tiket (Dashboard)", "h2"))
    el.extend(gambar("43-tiket-admin", "Dashboard → Tiket — percakapan bantuan dengan warga.", 14.5 * cm))

    el.append(P("6.12 Profil &amp; Notifikasi", "h2"))
    el.append(P(
        "Halaman <b>/profil</b> dipakai seluruh peran untuk memperbarui data diri dan mengganti "
        "kata sandi (kolom kata sandi dilengkapi ikon mata untuk menampilkan isian). Lonceng "
        "notifikasi di navbar memberi tahu warga saat status permohonannya berubah, dan memberi "
        "tahu petugas saat ada permohonan, pengaduan, atau kritik baru — disertai bunyi."))
    el.extend(gambar("45-profil", "Profil — ubah data diri &amp; ganti kata sandi.", 14.5 * cm))
    return el


def isi_penutup():
    el = []
    el.append(PageBreak())
    el.append(P("14. Riwayat Migrasi Data Portal Lama", "h1"))
    el.append(P(
        "Portal SAIBATIN menggantikan portal lama berbasis Laravel. Seluruh data dipindahkan lewat "
        "skrip yang disimpan di folder <i>scripts/</i> repositori, sehingga proses migrasi dapat "
        "ditelusuri dan diulang."))
    el.append(tabel([
        ["Data", "Sumber portal lama", "Hasil", "Catatan"],
        ["Akun pengguna", "tabel users (1.480 baris)", "1.378 akun",
         "102 pendaftaran ulang dengan NIK sama disatukan; kata sandi lama tetap berlaku"],
        ["Berita", "m_news_posts + m_news_images", "67 berita", "Gambar ikut dipindahkan"],
        ["Galeri", "m_galleries", "94 foto", "—"],
        ["Produk hukum", "m_product_hukums", "38 dokumen", "36 dari portal lama + 2 peraturan yang belum terdaftar"],
        ["Formulir &amp; persyaratan", "m_product_persyaratans + arsip berkas", "46 dokumen",
         "10 dari basis data + 36 formulir baku dari arsip berkas"],
        ["Produk layanan", "m_product_disdukcapil", "12 produk", "8 dengan persyaratan lengkap + 4 catatan pinggir"],
        ["Wilayah", "m_setup_kec + m_setup_kel", "11 kecamatan, 118 pekon", "Seluruhnya berkode 1813"],
        ["Demografi", "m_maps_dapduks", "1.032 baris", "8 kategori, tingkat kecamatan &amp; pekon"],
        ["Survei kepuasan", "m_mediainformasi_skm_survey", "203 jawaban", "9 unsur skala 1–4 dibawa apa adanya"],
        ["Pengaduan", "t_pengaduanmasyarakat", "2 aduan", "Data uji coba &amp; kiriman ganda tidak dibawa"],
    ], [3 * cm, 4.1 * cm, 3.1 * cm, 6.2 * cm]))
    el.append(P(
        "<b>Dokumen yang sengaja tidak diterbitkan.</b> Arsip berkas portal lama memuat sejumlah "
        "PDF milik kabupaten lain — berkop Kota Bandung, Kab. Sidenreng Rappang, Kab. Maluku "
        "Tenggara, Kab. Purbalingga, Kota Banjar, dan Kab. Berau — termasuk berkas SOP dan Standar "
        "Pelayanan. Berkas semacam itu tidak dimuat ke portal ini agar isi portal tetap murni "
        "identitas Kabupaten Pesisir Barat. Akibatnya kategori SOP dan Standar Pelayanan masih "
        "kosong dan perlu diisi dokumen resmi daerah.", "kecil"))

    el.append(P("15. Catatan Pemeliharaan", "h1"))
    el.append(tabel([
        ["Hal", "Keterangan"],
        ["Basis data", "MySQL. Skema dikelola Prisma (prisma/schema.prisma); ubah skema lewat <i>npm run db:push</i>."],
        ["Skrip migrasi", "scripts/migrasi-*-db-lama.sql — dijalankan terhadap basis data portal lama bernama <i>saibatin_lama</i>."],
        ["Berkas unggahan", "Dokumen publikasi di public/uploads/produk; gambar berita di public/uploads/berita; pustaka media di luar folder publik."],
        ["Zona waktu", "Seluruh perhitungan jam layanan memakai WIB (Asia/Jakarta) — lihat lib/jam-layanan.ts."],
        ["Aspek SKM", "Satu sumber kebenaran di lib/skm.ts (9 unsur, skala 1–4). Mengubah urutan unsur mengharuskan migrasi ulang kolom jawaban."],
        ["Kategori dokumen", "Didaftarkan di lib/dokumen-registry.ts, memetakan kategori ke halaman publik tempatnya tampil."],
        ["Identitas daerah", "lib/site-config.ts + variabel lingkungan NEXT_PUBLIC_*. Portal ini pernah difork menjadi portal daerah lain — pastikan berkas .env menunjuk basis data yang benar sebelum menjalankan seed."],
    ], [3.2 * cm, 13.2 * cm]))
    return el
