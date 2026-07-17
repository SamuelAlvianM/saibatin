"""Bagian kelima: lampiran rinci — wilayah, demografi, blok konten, kategori dokumen, deploy."""
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak

from buat_pdf import P, gambar, tabel


def lampiran():
    el = []
    el.append(PageBreak())
    el.append(P("Lampiran A — Wilayah Kabupaten Pesisir Barat", "h1"))
    el.append(P(
        "Daftar wilayah dipakai sebagai sumber pilihan (dropdown) pada formulir permohonan, dan "
        "sebagai kerangka data demografi serta peta GIS. Seluruhnya berkode 1813 sesuai kode "
        "Kabupaten Pesisir Barat."))
    el.append(tabel([
        ["Kode", "Kecamatan", "Jumlah pekon"],
        ["181301", "Pesisir Tengah", "8"],
        ["181302", "Pesisir Selatan", "15"],
        ["181303", "Lemong", "13"],
        ["181304", "Pesisir Utara", "12"],
        ["181305", "Karya Penggawa", "12"],
        ["181306", "Pulau Pisang", "6"],
        ["181307", "Way Krui", "10"],
        ["181308", "Krui Selatan", "10"],
        ["181309", "Ngambur", "9"],
        ["181310", "Bengkunat", "9"],
        ["181311", "Bengkunat Belimbing", "14"],
        ["", "<b>Total: 11 kecamatan</b>", "<b>118</b>"],
    ], [2.4 * cm, 8.4 * cm, 5.6 * cm]))

    el.append(P("Lampiran B — Kategori Data Demografi", "h1"))
    el.append(P(
        "Data demografi diimpor dari berkas Excel Dukcapil (SIAK) dan disimpan per wilayah pada "
        "dua tingkat: kecamatan (level 4) dan pekon/kelurahan (level 5). Tiap kategori menyimpan "
        "kolom nilainya sendiri, sehingga kartu statistik beranda dapat menunjuk kategori &amp; "
        "kolom mana pun."))
    el.append(tabel([
        ["Kategori", "Slug halaman", "Isi kolom"],
        ["Jenis Kelamin", "/media/demografi/jenis-kelamin", "L, P, JML"],
        ["Agama", "/media/demografi/agama", "Islam, Kristen, Katolik, Hindu, Buddha, Konghucu, Kepercayaan, JML"],
        ["Golongan Darah", "/media/demografi/gol-darah", "A, B, AB, O, dan varian rhesus, JML"],
        ["Pekerjaan", "/media/demografi/pekerjaan", "Rincian jenis pekerjaan, JML"],
        ["Kartu Keluarga", "/media/demografi/kk", "JML (jumlah kepala keluarga)"],
        ["Pendidikan", "/media/demografi/pendidikan", "Tidak/belum sekolah s.d. Strata III, JML"],
        ["Status Perkawinan", "/media/demografi/status-kawin", "Belum kawin, kawin, cerai hidup, cerai mati, JML"],
        ["Wajib KTP", "/media/demografi/wajib-ktp", "Wajib KTP, sudah rekam, belum rekam"],
    ], [3.2 * cm, 5.6 * cm, 7.6 * cm]))
    el.append(P(
        "Seluruhnya berjumlah <b>1.032 baris</b> (8 kategori × 129 wilayah). Data dapat diekspor "
        "kembali ke Excel dari Dashboard → Data Demografi.", "kecil"))

    el.append(PageBreak())
    el.append(P("Lampiran C — Blok Konten yang Dapat Disunting", "h1"))
    el.append(P(
        "Blok konten memungkinkan admin mengubah teks halaman publik tanpa menyentuh kode. Nilai "
        "bawaan tersimpan di dalam aplikasi; baris pada basis data hanya menimpanya. "
        "<b>Menghapus baris blok akan mengembalikan teks ke bawaan</b> — cara tercepat memulihkan "
        "konten yang terlanjur salah."))
    el.append(tabel([
        ["Kunci blok", "Halaman", "Isi yang dapat diubah"],
        ["beranda.hero", "/", "Judul utama, sub-judul, teks kolom pencarian"],
        ["beranda.carousel", "/", "Slide gambar pengumuman"],
        ["beranda.tentang", "/", "Paragraf pengantar tentang dinas"],
        ["profil.visi-misi", "/profil/visi-misi", "Visi &amp; daftar misi"],
        ["profil.motto", "/profil/motto", "Motto pelayanan"],
        ["profil.maklumat", "/profil/maklumat", "Maklumat pelayanan &amp; janji layanan"],
        ["profil.tugas", "/profil/tugas-fungsi", "Tugas pokok &amp; fungsi"],
        ["profil.struktur", "/profil/struktur", "Bagan struktur organisasi (jabatan &amp; atasan)"],
        ["produk.disdukcapil", "/produk/produk-disdukcapil", "Pengantar + 12 produk layanan beserta persyaratannya"],
        ["info.kebijakan-privasi", "/kebijakan-privasi", "Isi kebijakan privasi"],
        ["pelayanan.visibilitas", "/permohonan-online", "Daftar layanan yang disembunyikan"],
        ["info.produk.*, info.ppid.*, info.wbs.*", "Halaman produk/PPID/WBS", "Judul &amp; isi tiap halaman informasi"],
    ], [4.3 * cm, 4.6 * cm, 7.5 * cm]))

    el.append(P("Lampiran D — Kategori Dokumen Publikasi", "h1"))
    el.append(P(
        "Tiap kategori terhubung ke halaman publik tertentu. Mengunggah dokumen pada kategori "
        "berikut akan langsung menampilkannya di halaman yang tercantum."))
    el.append(tabel([
        ["Kelompok", "Kategori", "Halaman publik"],
        ["Produk Layanan", "Formulir &amp; Persyaratan", "/produk/formulir-persyaratan"],
        ["Produk Layanan", "Produk Hukum", "/produk/hukum"],
        ["Produk Layanan", "SOP", "/produk/sop dan /ppid/sop"],
        ["Produk Layanan", "Standar Pelayanan", "/ppid/standar-pelayanan"],
        ["PPID / Transparansi", "Profil PPID", "/ppid/profil-ppid"],
        ["PPID / Transparansi", "LHKPN", "/ppid/lhkpn"],
        ["PPID / Transparansi", "Laporan PPID Pelaksana", "/ppid/laporan-ppid-pelaksana"],
        ["PPID / Transparansi", "LKJIP", "/ppid/lkjip"],
        ["PPID / Transparansi", "Laporan Survey Kepuasan Masyarakat", "/ppid/survey-kepuasan-masyarakat"],
        ["PPID / Transparansi", "Buku Profil Kependudukan", "/ppid/buku-profil-kependudukan"],
        ["PPID / Transparansi", "Dokumen Pelaksana Anggaran (DPA)", "/ppid/dpa"],
        ["PPID / Transparansi", "Indikator Kinerja Individu (IKI)", "/ppid/iki"],
        ["PPID / Transparansi", "Rencana Kinerja Tahunan (RKT)", "/ppid/rkt"],
        ["PPID / Transparansi", "Rencana Kerja (Renka)", "/ppid/renka"],
        ["PPID / Transparansi", "Perjanjian Kerjasama", "/ppid/perjanjian-kerjasama"],
        ["PPID / Transparansi", "Renstra OPD", "/ppid/renstra-opd"],
        ["PPID / Transparansi", "Indikator Kinerja Utama (IKU)", "/ppid/iku"],
        ["PPID / Transparansi", "Perjanjian Kinerja", "/ppid/perjanjian-kinerja"],
        ["PPID / Transparansi", "Zona Integritas", "/ppid/zona-integritas"],
        ["PPID / Transparansi", "Pengendalian Gratifikasi", "/ppid/pengendalian-gratifikasi"],
    ], [3.5 * cm, 6.6 * cm, 6.3 * cm]))

    el.append(PageBreak())
    el.append(P("Lampiran E — Daftar Formulir &amp; Persyaratan yang Tersedia", "h1"))
    el.append(P(
        "Berikut 46 berkas yang dapat diunduh warga di <b>/produk/formulir-persyaratan</b>. "
        "Formulir baku mengikuti penomoran Lampiran Permendagri No. 109 Tahun 2019."))
    el.append(tabel([
        ["Kode", "Nama formulir"],
        ["F-1.01", "Formulir Biodata Penduduk Warga Negara Indonesia"],
        ["F-1.02", "Formulir Pendaftaran Peristiwa Kependudukan"],
        ["F-1.03", "Formulir Pendaftaran Perpindahan Penduduk (Pindah / SKPLN / SKTT)"],
        ["F-1.04", "Surat Pernyataan Tidak Memiliki Dokumen Kependudukan"],
        ["F-1.05", "Surat Pernyataan Perubahan Data Kependudukan"],
        ["F-1.06", "Formulir Biodata Penduduk untuk Perubahan Data WNI"],
        ["F-1.07", "Surat Kuasa dalam Pelayanan Administrasi Kependudukan"],
        ["F-1.08", "Formulir Biodata Penduduk Orang Asing (Izin Tinggal Terbatas/Tetap)"],
        ["F-1.15", "Formulir Permohonan Kartu Keluarga Baru WNI"],
        ["F-1.16", "Formulir Permohonan Perubahan Kartu Keluarga WNI"],
        ["F-1.17", "Formulir Permohonan Kartu Keluarga Baru Orang Asing (Izin Tinggal Tetap)"],
        ["F-1.23", "Formulir Permohonan Pindah Datang WNI dalam Satu Desa/Kelurahan"],
        ["F-2.01", "Surat Keterangan Kelahiran"],
        ["F-2.05", "Formulir Pelaporan Kelahiran di Luar Negeri (melalui KJRI)"],
        ["F-2.08", "Formulir Pelaporan Lahir Mati WNI"],
        ["F-2.10", "Surat Pernyataan Pengakuan Anak"],
        ["F-2.12", "Formulir Pencatatan Perkawinan"],
        ["F-2.13", "Formulir Pelaporan Perkawinan di Luar Negeri (melalui Kedutaan Besar RI)"],
        ["SPTJM", "Kebenaran Data Kelahiran; Kebenaran sebagai Pasangan Suami Isteri"],
        ["Surat Pernyataan", "Alamat digunakan dalam adminduk; alamat rumah milik sendiri; tidak keberatan numpang KK"],
        ["Surat Pernyataan", "Lahir di luar kawin (anak &amp; dewasa); singkatan nama; beda nama"],
        ["Surat Pernyataan", "Belum pernah membuat akta kelahiran (anak &amp; dewasa); jarak kelahiran anak"],
        ["Surat Pernyataan", "Kelahiran dibantu paraji yang sudah meninggal; status kewarganegaraan WNA"],
        ["Surat Pernyataan", "Batal pindah (pembatalan SKPWNI); SKPWNI bagi yang sudah berada di luar daerah"],
        ["Lainnya", "Syarat pembuatan dokumen Dukcapil Pesisir Barat; SPTJM pembatalan akta kematian"],
    ], [3 * cm, 13.4 * cm]))

    el.append(P("Lampiran F — Penerapan (Deployment)", "h1"))
    el.append(tabel([
        ["Hal", "Keterangan"],
        ["Skrip penerapan", "deploy/deploy.sh — membangun aplikasi secara lokal lalu mengunggahnya ke server"],
        ["Server web", "Nginx (deploy/nginx-saibatin.conf) sebagai proxy ke aplikasi Node"],
        ["Manajer proses", "PM2 (deploy/ecosystem.config.cjs)"],
        ["Penyiapan basis data", "deploy/server-db-setup.sh; gunakan opsi --db-setup --skip-seed bila hanya menambah tabel baru"],
        ["Variabel penting", "DATABASE_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_APP_KODE (1813), FONNTE_TOKEN, MASTER_PASSWORD"],
        ["Peringatan", "Server dipakai bersama beberapa portal daerah. Pastikan berkas .env menunjuk basis data dan domain yang benar sebelum menjalankan seed — seed portal lain pernah menimpa data portal ini."],
    ], [3.4 * cm, 13 * cm]))
    return el
