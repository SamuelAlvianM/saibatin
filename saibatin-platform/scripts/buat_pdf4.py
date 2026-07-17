"""Bagian keempat: daftar isi, notifikasi, glosarium, pemecahan masalah."""
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak

from buat_pdf import P, gambar, tabel


def daftar_isi():
    """Daftar isi — tidak ada pada panduan KTT; ditambahkan agar dokumen mudah dinavigasi."""
    el = [P("Daftar Isi", "h1")]
    el.append(tabel([
        ["Bab", "Isi"],
        ["1", "Identitas Visual (Branding) — palet warna &amp; identitas daerah"],
        ["2", "Galeri Tampilan (Screenshot)"],
        ["3", "Peta Halaman Publik (Warga) — seluruh URL &amp; fungsinya"],
        ["4", "Dokumentasi Halaman Publik — per halaman (beranda, register, permohonan, riwayat, "
              "produk, media, pengaduan/WBS, PPID, peta situs, 404)"],
        ["5", "Dashboard Admin — peta menu &amp; hak akses per level"],
        ["6", "Tutorial Dashboard — langkah demi langkah per menu"],
        ["7", "Role Pengguna &amp; Wewenangnya"],
        ["8", "Sistem Disabilitas (Widget Aksesibilitas)"],
        ["9", "Rincian 17 Jenis Layanan Permohonan &amp; tahapan wizard-nya"],
        ["10", "Pengaduan, Kritik-Saran &amp; WBS — harus diapakan"],
        ["11", "Laporan &amp; Dokumen PDF (PPID, LHKPN, dll.)"],
        ["12", "Ringkasan API"],
        ["13", "Akun Demo &amp; Catatan Pengembangan"],
        ["14", "Riwayat Migrasi Data Portal Lama"],
        ["15", "Catatan Pemeliharaan"],
        ["16", "Sistem Notifikasi"],
        ["17", "Istilah yang Dipakai"],
        ["18", "Pemecahan Masalah Umum"],
        ["Lamp. A", "Wilayah Kabupaten Pesisir Barat — 11 kecamatan &amp; 118 pekon"],
        ["Lamp. B", "Kategori Data Demografi"],
        ["Lamp. C", "Blok Konten yang Dapat Disunting"],
        ["Lamp. D", "Kategori Dokumen Publikasi"],
        ["Lamp. E", "Daftar Formulir &amp; Persyaratan yang Tersedia"],
        ["Lamp. F", "Penerapan (Deployment)"],
    ], [1.4 * cm, 15 * cm]))
    el.append(PageBreak())
    return el


def isi_tambahan2():
    el = []
    el.append(P("4.15 Kritik &amp; Saran, dan Lupa Kata Sandi", "h2"))
    el.extend(gambar("08-kritik-saran", "Kritik &amp; Saran — form singkat; masuk ke Dashboard dan memicu notifikasi petugas.", 14 * cm))
    el.extend(gambar("05-lupa-password", "Lupa Kata Sandi — kirim tautan atur ulang ke e-mail/WhatsApp terdaftar.", 13 * cm))

    el.append(P("4.16 Tiket Bantuan (sisi warga)", "h2"))
    el.extend(gambar("46-tiket", "Tiket Bantuan — warga bertanya, petugas menjawab; tiket tertutup otomatis bila tidak ada aktivitas.", 14 * cm))
    return el


def isi_penutup2():
    el = []
    el.append(PageBreak())
    el.append(P("16. Sistem Notifikasi", "h1"))
    el.append(P(
        "Notifikasi tampil sebagai lonceng di navbar (warga) dan di dashboard (petugas), disertai "
        "bunyi saat notifikasi baru tiba. Mengklik notifikasi membawa pengguna langsung ke halaman "
        "yang bersangkutan."))
    el.append(tabel([
        ["Jenis", "Penerima", "Dipicu oleh"],
        ["PERMOHONAN_STATUS", "Warga pemohon", "Petugas mengubah status permohonan (Diproses/Selesai/Ditolak)"],
        ["PERMOHONAN_BARU", "Petugas (level 1 &amp; 2)", "Warga mengirim permohonan baru"],
        ["PENGADUAN_BARU", "Petugas (level 1 &amp; 2)", "Warga mengirim pengaduan/WBS"],
        ["KRITIK_BARU", "Petugas (level 1 &amp; 2)", "Warga mengirim kritik &amp; saran"],
    ], [4 * cm, 4 * cm, 8.4 * cm]))
    el.append(P(
        "Notifikasi dorong ke ponsel (Web Push) belum diaktifkan karena memerlukan situs berjalan "
        "di HTTPS. Kode aktivasi pendaftaran dan pemberitahuan pengajuan tetap dikirim lewat "
        "WhatsApp dan e-mail.", "kecil"))

    el.append(P("17. Istilah yang Dipakai", "h1"))
    el.append(tabel([
        ["Istilah", "Arti"],
        ["Adminduk", "Administrasi Kependudukan"],
        ["Capil", "Pencatatan Sipil — akta kelahiran, kematian, perkawinan, perceraian, pengakuan anak"],
        ["Dafduk", "Pendaftaran Penduduk — KTP-el, KK, pindah datang, KIA"],
        ["Pekon", "Sebutan desa di Kabupaten Pesisir Barat (Provinsi Lampung)"],
        ["NIK", "Nomor Induk Kependudukan — 16 digit; dipakai sebagai User ID warga"],
        ["SKM", "Survei Kepuasan Masyarakat"],
        ["IKM", "Indeks Kepuasan Masyarakat — nilai 0–100 hasil olahan jawaban SKM"],
        ["SKPWNI", "Surat Keterangan Pindah Warga Negara Indonesia"],
        ["SPTJM", "Surat Pernyataan Tanggung Jawab Mutlak"],
        ["WBS", "Whistle Blowing System — sarana pelaporan dugaan pelanggaran"],
        ["PPID", "Pejabat Pengelola Informasi dan Dokumentasi"],
        ["LHKPN", "Laporan Harta Kekayaan Penyelenggara Negara"],
        ["OPD", "Organisasi Perangkat Daerah — instansi pemerintah daerah"],
        ["SIAK", "Sistem Informasi Administrasi Kependudukan"],
        ["OCR", "<i>Optical Character Recognition</i> — pembacaan teks dari foto KTP"],
    ], [3 * cm, 13.4 * cm]))

    el.append(P("18. Pemecahan Masalah Umum", "h1"))
    el.append(tabel([
        ["Gejala", "Kemungkinan sebab &amp; penanganan"],
        ["Warga lama tidak bisa login", "Pastikan memakai NIK sebagai User ID (bukan e-mail). Kata sandi portal lama tetap berlaku. Bila pernah memakai “lupa kata sandi” di portal lama, gunakan kata sandi terbaru — atau atur ulang lewat /forgot-password."],
        ["Akun OPD/petugas tidak bisa login", "Akun instansi memakai <i>username</i>, bukan NIK. Periksa juga status akun (aktif/nonaktif) di Dashboard → Manajemen Akun."],
        ["Judul halaman menyebut daerah lain", "Blok konten pernah ditimpa. Buka Dashboard → Konten Halaman, kosongkan blok tersebut agar kembali ke teks bawaan Pesisir Barat."],
        ["Teks tampil seperti “ÔÇö”", "Berkas diimpor dengan set karakter yang salah. Jalankan ulang impor dengan <i>--default-character-set=utf8mb4</i>."],
        ["Halaman SOP / Standar Pelayanan kosong", "Memang belum ada dokumennya. Unggah lewat Dashboard → Dokumen Publikasi pada kategori yang bersesuaian."],
        ["Kartu statistik beranda kosong/0", "Data demografi belum diimpor untuk kategori tersebut, atau kolom pada kartu tidak cocok dengan bentuk datanya. Periksa Dashboard → Data Demografi."],
        ["Nilai IKM terasa terlalu rendah", "Pastikan jawaban memakai skala 1–4 (Permenpan). Jawaban berskala 1–5 dari data lama akan menyimpangkan hasil."],
        ["Berkas PDF tidak bisa diunduh", "Periksa berkas fisik ada di public/uploads/produk dan kolom berkas pada dokumen menunjuk nama yang sama."],
        ["Jam layanan tampil salah", "Zona waktu portal WIB (Asia/Jakarta). Periksa pengaturan jam di drawer Dashboard → Pengajuan Baru."],
    ], [4 * cm, 12.4 * cm]))
    return el
