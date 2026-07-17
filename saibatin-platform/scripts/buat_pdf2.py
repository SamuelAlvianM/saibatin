"""Bagian kedua isi PDF: dashboard, tutorial, role, layanan, API, akun demo."""
from reportlab.platypus import PageBreak
from reportlab.lib.units import cm

from buat_pdf import P, tabel, gambar


def isi_dokumen2():
    el = []

    # ── 5. Dashboard ───────────────────────────────────────────────────────
    el.append(PageBreak())
    el.append(P("5. Dashboard Admin (/dashboard)", "h1"))
    el.append(P(
        "Dashboard adalah ruang kerja petugas. Menu yang tampil <b>menyesuaikan level akun</b>: "
        "grup “Konten &amp; Media” (Konten Halaman, Berita, Galeri, Pustaka Media, Dokumen "
        "Publikasi, Data Demografi) hanya terlihat oleh admin level 1; petugas level 2 melihat "
        "menu operasional saja."))
    el.extend(gambar("31-dashboard-penuh", "Dashboard — ringkasan agregasi permohonan, pengaduan, dan aktivitas terbaru.", 15 * cm))
    el.append(tabel([
        ["Menu", "URL", "Fungsi", "Level"],
        ["Ringkasan", "/dashboard", "Kartu agregasi permohonan/pengaduan + grafik tren", "1, 2, 4"],
        ["Pengajuan Baru", "/dashboard/pengajuan-baru", "Petugas membuatkan pengajuan untuk warga di loket", "1, 2"],
        ["Permohonan", "/dashboard/permohonan", "Memproses pengajuan: verifikasi → proses → selesai/tolak", "1, 2"],
        ["Konten Halaman", "/dashboard/konten", "Menyunting blok konten halaman publik", "1"],
        ["Berita", "/dashboard/berita", "Tulis/sunting/terbitkan berita", "1"],
        ["Galeri", "/dashboard/galeri", "Kelola foto kegiatan", "1"],
        ["Pustaka Media", "/dashboard/media", "Pustaka gambar/berkas terpusat", "1"],
        ["Dokumen Publikasi", "/dashboard/produk", "Unggah PDF ke kategori (Hukum, Persyaratan, SOP, PPID…)", "1"],
        ["Data Demografi", "/dashboard/demografi", "Impor/ekspor & sunting data demografi", "1"],
        ["Pengaduan", "/dashboard/pengaduan", "Menindaklanjuti pengaduan & kritik-saran", "1, 2"],
        ["SKM &amp; IKM", "/dashboard/skm", "Rekap survei & Indeks Kepuasan Masyarakat", "1, 2"],
        ["Manajemen Akun", "/dashboard/users", "Kelola akun warga, staf, dan OPD", "1"],
        ["Tiket", "/dashboard/tiket", "Menjawab tiket bantuan warga", "1, 2"],
    ], [3.1 * cm, 4.2 * cm, 7.3 * cm, 1.8 * cm]))

    # ── 6. Tutorial dashboard ──────────────────────────────────────────────
    el.append(PageBreak())
    el.append(P("6. Tutorial Dashboard — Langkah demi Langkah per Menu", "h1"))

    el.append(P("6.1 Memproses Permohonan Warga", "h2"))
    el.append(P(
        "1. Buka <b>Dashboard → Permohonan</b>. Daftar tersaring berdasarkan status; pengajuan baru "
        "berstatus <i>Menunggu</i>.<br/>"
        "2. Klik satu baris untuk membuka detail: seluruh isian formulir dan berkas unggahan warga.<br/>"
        "3. Periksa kecocokan berkas dengan persyaratan layanan tersebut.<br/>"
        "4. Ubah status: <i>Diproses</i> → <i>Selesai</i>, atau <i>Ditolak</i> disertai catatan alasan.<br/>"
        "5. Klik <b>Simpan</b> — warga otomatis menerima notifikasi lonceng perubahan status."))
    el.extend(gambar("33-permohonan", "Dashboard → Permohonan — antrian pengajuan warga beserta statusnya.", 14.5 * cm))

    el.append(P("6.2 Pengajuan Baru (bantu warga di loket)", "h2"))
    el.append(P(
        "1. Buka <b>Dashboard → Pengajuan Baru</b> — tampil grid kartu layanan beserta kolom "
        "pencarian.<br/>"
        "2. Pilih jenis layanan, lalu isikan data warga yang datang ke loket.<br/>"
        "3. Berkas dapat dipindai langsung memakai kamera; OCR KTP mengisi NIK &amp; nama otomatis.<br/>"
        "4. Kirim — pengajuan masuk ke antrian sama seperti pengajuan mandiri warga.<br/>"
        "5. Jam operasional layanan diatur lewat tombol <b>Pengaturan</b> di kanan atas (zona WIB)."))
    el.append(P(
        "Berbeda dengan halaman publik, grid petugas <b>tidak ikut disaring pengaturan "
        "visibilitas</b> — petugas tetap melihat seluruh layanan yang tersedia pada formulir loket "
        "(15 jenis; Kartu Keluarga Sakinah dan Pencetakan KTP dilayani lewat jalur lain).", "kecil"))
    el.extend(gambar("32-pengajuan-baru", "Dashboard → Pengajuan Baru — petugas membuatkan pengajuan untuk warga; sidebar menampilkan seluruh menu admin level 1.", 15 * cm))

    el.append(P("6.3 Konten Halaman &amp; Mode Edit Inline", "h2"))
    el.append(P(
        "1. Buka <b>Dashboard → Konten Halaman</b> untuk melihat seluruh blok konten yang dapat "
        "disunting (hero beranda, visi-misi, maklumat, struktur organisasi, produk, PPID, dst).<br/>"
        "2. Pilih blok → ubah isian → <b>Simpan</b>. Nilai yang disimpan menimpa teks bawaan.<br/>"
        "3. Alternatifnya, admin level 1 dapat menekan tombol <b>Mode Edit</b> yang mengambang di "
        "halaman publik, lalu menyunting blok langsung di tempat.<br/>"
        "4. Kolom penjelasan produk memakai editor berformat (tebal, daftar bernomor, tautan)."))
    el.extend(gambar("34-konten", "Dashboard → Konten Halaman — daftar blok konten yang dapat disunting.", 14.5 * cm))

    el.append(P("6.4 Dokumen Publikasi (Produk)", "h2"))
    el.append(P(
        "1. Buka <b>Dashboard → Dokumen Publikasi</b>.<br/>"
        "2. Pilih kategori (Formulir &amp; Persyaratan, Produk Hukum, SOP, Standar Pelayanan, "
        "LHKPN, LKJIP, DPA, IKU, dan seterusnya).<br/>"
        "3. Klik <b>Tambah</b>, isi judul, unggah berkas (umumnya PDF, maksimal 5 MB).<br/>"
        "4. Tiap kategori mencantumkan halaman publik tempat berkas itu akan muncul, sehingga "
        "petugas tahu persis dampak unggahannya.<br/>"
        "<b>Saat ini terisi 85 dokumen</b> hasil migrasi portal lama: 38 produk hukum, 46 formulir "
        "&amp; persyaratan, dan 1 LHKPN."))
    el.extend(gambar("38-produk-admin", "Dashboard → Dokumen Publikasi — 85 dokumen hasil migrasi portal lama.", 14.5 * cm))

    el.append(P("6.5 SKM &amp; IKM", "h2"))
    el.append(P(
        "Rekap survei mengikuti <b>Permenpan RB No. 14 Tahun 2017</b>: 9 unsur pelayanan dengan "
        "skala 1–4. Dashboard menghitung rata-rata per unsur, Nilai IKM (skala 0–100), serta mutu "
        "pelayanan (A/B/C/D). Data saat ini: <b>203 responden hasil migrasi portal lama, Nilai IKM "
        "90,92 — mutu A (Sangat Baik)</b>."))
    el.append(tabel([
        ["Nilai IKM", "Mutu", "Kinerja unit pelayanan"],
        ["88,31 – 100,00", "A", "Sangat Baik"],
        ["76,61 – 88,30", "B", "Baik"],
        ["65,00 – 76,60", "C", "Kurang Baik"],
        ["25,00 – 64,99", "D", "Tidak Baik"],
    ], [4.2 * cm, 2.2 * cm, 10.2 * cm]))
    el.extend(gambar("41-skm-admin", "Dashboard → SKM — 203 responden, Nilai IKM 90,92, mutu A (Sangat Baik).", 14.5 * cm))

    el.append(P("6.6 Manajemen Akun", "h2"))
    el.append(P(
        "Halaman terbagi tiga tab: <b>Warga</b>, <b>Staf</b>, dan <b>OPD</b>. Admin dapat "
        "menambah, menyunting, mengaktifkan/menonaktifkan akun, serta mengatur ulang kata sandi. "
        "Pembuatan akun berlevel tinggi memerlukan akun level 1. Saat ini terdapat "
        "<b>1.385 akun</b> (7 akun bawaan + 1.378 akun hasil migrasi portal lama)."))
    el.extend(gambar("42-users-admin", "Dashboard → Manajemen Akun — tab Warga/Staf/OPD.", 14.5 * cm))

    el.append(P("6.7 Data Demografi", "h2"))
    el.append(P(
        "Data demografi diimpor dari berkas Excel Dukcapil (SIAK). Tersedia 8 kategori "
        "(jenis kelamin, agama, golongan darah, pekerjaan, kartu keluarga, pendidikan, status "
        "perkawinan, wajib KTP) untuk 11 kecamatan dan 118 pekon — total 1.032 baris. Editor "
        "layar penuh memudahkan penyuntingan massal, dan hasilnya langsung memberi angka pada "
        "kartu statistik beranda serta halaman GIS."))
    el.extend(gambar("39-demografi-admin", "Dashboard → Data Demografi — impor/ekspor dan editor layar penuh.", 14.5 * cm))

    # ── 7. Role ────────────────────────────────────────────────────────────
    el.append(PageBreak())
    el.append(P("7. Role Pengguna &amp; Wewenangnya", "h1"))
    el.append(tabel([
        ["Level", "Sebutan", "Wewenang", "Jumlah akun"],
        ["1", "Super Admin", "Seluruh menu termasuk Konten &amp; Media, Manajemen Akun, dan Mode Edit halaman publik", "7"],
        ["2", "Operator / Petugas", "Permohonan, Pengajuan Baru, Pengaduan, SKM, Tiket. Tidak dapat mengubah konten publik", "5"],
        ["3", "Warga", "Mengajukan permohonan, melihat riwayat, membuka tiket, mengisi survei", "1.233"],
        ["4", "Operator OPD / Pekon", "Akun instansi &amp; operator pekon; mengajukan atas nama instansi", "140"],
    ], [1.5 * cm, 3.2 * cm, 9.5 * cm, 2.2 * cm]))
    el.append(P(
        "<b>Catatan migrasi:</b> level portal lama tidak sepadan satu-satu dengan level portal baru. "
        "Pemetaan yang dipakai: <i>operator capil</i> (pengelola seluruh konten portal lama) → "
        "level 1; <i>masyarakat</i> → level 3; <i>developer</i> → level 2; serta 136 akun "
        "operator pekon (level 41 pada portal lama, tidak terdaftar di master level) → level 4.",
        "kecil"))

    # ── 8. Aksesibilitas ───────────────────────────────────────────────────
    el.append(P("8. Sistem Disabilitas (Widget Aksesibilitas)", "h1"))
    el.append(P(
        "Tombol bulat di tepi kanan layar membuka panel aksesibilitas. Fitur: perbesar/perkecil "
        "skala teks, jarak antar teks, kontras tinggi, invert warna, skala abu-abu, latar terang, "
        "sorot tautan, kursor besar, serta pembacaan teks (<i>text-to-speech</i> berbahasa "
        "Indonesia). Pengaturan tersimpan di peramban sehingga tetap berlaku saat halaman berganti."))

    # ── 9. 17 jenis layanan ────────────────────────────────────────────────
    el.append(PageBreak())
    el.append(P("9. Rincian 17 Jenis Layanan Permohonan", "h1"))
    el.append(tabel([
        ["Jenis layanan", "Kategori", "Tahapan wizard"],
        ["Akta Kelahiran (NIK Sudah Ada)", "Capil", "1 Data Pemohon → 2 Biodata Anak → 3 Data Ortu → 4 Data Kelahiran → 5 Saksi → 6 Dokumen"],
        ["Akta Kelahiran (NIK Belum Ada)", "Capil", "1 Data Pemohon → 2 Data Anak → 3 Data Orang Tua → 4 Data Kelahiran → 5 Data Saksi → 6 Dokumen"],
        ["Akta Perkawinan/Nikah", "Capil", "1 Data Pemohon → 2 Data Suami → 3 Data Istri → 4 Saksi &amp; Acara → 5 Dokumen"],
        ["Akta Kematian", "Capil", "1 Data Pemohon → 2 Data Jenazah → 3 Data Ortu → 4 Data Kematian → 5 Dokumen"],
        ["Akta Perceraian", "Capil", "1 Data Pemohon → 2 Data Perceraian → 3 Dokumen"],
        ["Kartu Identitas Anak (KIA)", "Capil", "1 Data Pemohon → 2 Data Anak → 3 Dokumen"],
        ["Kartu Keluarga Sakinah", "Capil", "1 Data Pemohon → 2 Data Keluarga → 3 Dokumen"],
        ["KTP Elektronik", "Dafduk", "1 Data Pemohon → 2 Data KTP-el (pilih alasan) → 3 Dokumen"],
        ["Pencetakan KTP", "Dafduk", "1 Data Pemohon → 2 Data Pencetakan → 3 Dokumen"],
        ["Surat Keterangan Pindah", "Dafduk", "1 Data Pemohon → 2 Data Perpindahan → 3 Dokumen"],
        ["Surat Keterangan Kedatangan", "Dafduk", "1 Data Pemohon → 2 Data Kedatangan → 3 Dokumen"],
        ["Konsolidasi/Update Data", "Dafduk", "1 Data Pemohon → 2 Konsolidasi → 3 Dokumen"],
        ["KK — Tambah Anak", "Dafduk", "1 Data Pemohon → 2 Data Anak → 3 Dokumen"],
        ["KK — Pisah KK", "Dafduk", "1 Data Pemohon → 2 Jenis Pisah → 3 Alamat Tujuan → 4 Dokumen"],
        ["KK — Numpang KK", "Dafduk", "1 Data Pemohon → 2 Data KK Numpang → 3 Dokumen"],
        ["KK — Perubahan Biodata", "Dafduk", "1 Data Pemohon → 2 Pilih Biodata → 3 Isi Biodata → 4 Dokumen"],
        ["KK — Cetak Ulang", "Dafduk", "1 Data Pemohon → 2 Data KK → 3 Dokumen"],
    ], [4.5 * cm, 1.8 * cm, 10.1 * cm]))

    # ── 10. Pengaduan/WBS ──────────────────────────────────────────────────
    el.append(PageBreak())
    el.append(P("10. Pengaduan, Kritik-Saran &amp; WBS — Harus Diapakan?", "h1"))
    el.append(tabel([
        ["Kanal", "Masuk ke", "Tindak lanjut"],
        ["Pengaduan Masyarakat &amp; WBS (/pengaduan)", "Dashboard → Pengaduan; memicu notifikasi petugas",
         "Petugas membaca aduan, mengubah status (Baru → Diproses → Selesai), dan mengisi balasan. Untuk laporan WBS, identitas pelapor dijaga kerahasiaannya."],
        ["Kritik &amp; Saran (/hubungi-kami/kritik-saran)", "Dashboard → Kritik-Saran; memicu notifikasi petugas",
         "Dibaca sebagai masukan perbaikan layanan; tidak berstatus."],
        ["Survei Kepuasan (SKM)", "Dashboard → SKM", "Terhitung otomatis ke Nilai IKM &amp; mutu pelayanan; saran responden ditampilkan di rekap."],
        ["Tiket Bantuan (/tiket)", "Dashboard → Tiket", "Dijawab petugas seperti percakapan; tertutup otomatis bila tidak ada aktivitas."],
    ], [4.3 * cm, 4.5 * cm, 7.6 * cm]))
    el.append(P(
        "Kanal /pengaduan berfungsi ganda: pengaduan pelayanan adminduk sekaligus <b>Whistle "
        "Blowing System</b> — sarana pelaporan dugaan pelanggaran/tindak pidana korupsi di "
        "lingkungan Disdukcapil Kabupaten Pesisir Barat."))

    # ── 11. Dokumen PDF ────────────────────────────────────────────────────
    el.append(P("11. Laporan &amp; Dokumen PDF (PPID, LHKPN, dll.)", "h1"))
    el.append(P(
        "Kategori dokumen didaftarkan terpusat sehingga admin selalu tahu “PDF ini akan muncul di "
        "halaman apa”. Kategori yang tersedia: Formulir &amp; Persyaratan, Produk Hukum, SOP, "
        "Standar Pelayanan, Profil PPID, LHKPN, Laporan PPID Pelaksana, LKJIP, Laporan SKM, Buku "
        "Profil Kependudukan, DPA, IKI, RKT, Renka, Perjanjian Kerjasama, Renstra OPD, IKU, "
        "Perjanjian Kinerja, Zona Integritas, dan Pengendalian Gratifikasi."))
    el.append(tabel([
        ["Kategori", "Jumlah dokumen", "Halaman publik"],
        ["Produk Hukum", "38", "/produk/hukum"],
        ["Formulir &amp; Persyaratan", "46", "/produk/formulir-persyaratan"],
        ["LHKPN", "1", "/ppid/lhkpn"],
        ["SOP", "0 — belum tersedia", "/produk/sop, /ppid/sop"],
        ["Standar Pelayanan", "0 — belum tersedia", "/ppid/standar-pelayanan"],
    ], [4.6 * cm, 3.4 * cm, 8.4 * cm]))
    el.append(P(
        "<b>Catatan:</b> berkas SOP dan Standar Pelayanan yang ada di arsip portal lama ternyata "
        "milik kabupaten lain (Kab. Sidenreng Rappang) sehingga sengaja tidak diterbitkan. Kedua "
        "kategori perlu diisi dokumen resmi Kabupaten Pesisir Barat melalui Dashboard → Dokumen "
        "Publikasi.", "kecil"))

    # ── 12. API ────────────────────────────────────────────────────────────
    el.append(PageBreak())
    el.append(P("12. Dokumentasi API (Request &amp; Response)", "h1"))
    el.append(P(
        "Seluruh endpoint mengembalikan bentuk jawaban yang seragam, mengikuti kontrak portal "
        "Laravel lama agar sisi depan tidak perlu diubah besar-besaran:"))
    el.append(tabel([
        ["Kolom", "Arti"],
        ["error", "Daftar pesan galat (string[]). Kosong bila berhasil."],
        ["success", "Daftar pesan berhasil (string[]). Pesan berawalan “Info:” ditampilkan sebagai pemberitahuan."],
        ["data", "Muatan jawaban; bernilai null saat gagal."],
        ["html", "Disediakan demi kompatibilitas kontrak lama; umumnya array kosong."],
    ], [2.6 * cm, 13.8 * cm]))
    el.append(P(
        "Autentikasi memakai kuki sesi — tidak ada token yang perlu dikirim manual. Endpoint "
        "berawalan /api/admin/… menolak permintaan tanpa sesi petugas.", "kecil"))

    el.append(P("12.1 POST /api/skm — kirim jawaban survei", "h3"))
    el.append(tabel([
        ["Bagian", "Isi"],
        ["Request", "{ \"nama\": \"Ahmad Sueb\", \"umur\": 35, \"jenisKel\": \"L\", "
                    "\"pekerjaan\": \"PERDAGANGAN\", \"jawaban\": { \"0\": 4, \"1\": 4, \"2\": 3, "
                    "\"3\": 4, \"4\": 3, \"5\": 3, \"6\": 3, \"7\": 3, \"8\": 3 }, "
                    "\"saran\": \"Pertahankan pelayanan yang ramah\" }"],
        ["Aturan", "Nama wajib diisi. Seluruh 9 unsur (indeks \"0\"–\"8\") wajib bernilai 1–4; "
                   "nilai di luar rentang ditolak."],
        ["Berhasil", "{ \"error\": [], \"success\": [ … ], \"data\": { … }, \"html\": [] }"],
        ["Gagal (400)", "{ \"error\": [\"Info: Mohon nilai semua unsur pelayanan (1-4)\"], "
                        "\"success\": [], \"data\": null, \"html\": [] }"],
        ["Efek samping", "Petugas level 1 &amp; 2 menerima notifikasi."],
    ], [2.6 * cm, 13.8 * cm]))

    el.append(P("12.2 GET /api/admin/skm — rekap SKM &amp; IKM", "h3"))
    el.append(tabel([
        ["Bagian", "Isi"],
        ["Akses", "Wajib sesi petugas."],
        ["data", "{ \"totalResponden\": 203, \"rataKeseluruhan\": 3.64, \"nilaiIKM\": 90.92, "
                 "\"skalaMax\": 4, \"rataPerAspek\": [ { \"aspek\": \"Kesesuaian persyaratan…\", "
                 "\"rata\": 3.66 }, … ], \"respondenTerbaru\": [ { \"id\": 204, \"nama\": \"…\", "
                 "\"rataSkor\": 3.7, \"saran\": \"…\", \"createdAt\": \"…\" }, … ] }"],
        ["Catatan", "nilaiIKM = (rataKeseluruhan ÷ skalaMax) × 100. Huruf mutu A/B/C/D dihitung di "
                    "sisi tampilan mengikuti ambang Permenpan. respondenTerbaru dibatasi 15 baris; "
                    "responden tanpa nama ditampilkan sebagai “Anonim”."],
    ], [2.6 * cm, 13.8 * cm]))

    el.append(P("12.3 POST /api/upload — unggah berkas", "h3"))
    el.append(tabel([
        ["Bagian", "Isi"],
        ["Request", "multipart/form-data dengan kolom <i>file</i> dan <i>folder</i> (mis. \"produk\")."],
        ["Batasan", "Maksimal 5 MB; hanya .jpg, .jpeg, .png, .pdf. Wajib sudah login."],
        ["data", "{ \"url\": \"/uploads/produk/1_1721….pdf\" } — simpan nilai url ini ke kolom berkas dokumen."],
        ["Gagal (400)", "error berisi mis. \"Ukuran file maksimal 5 MB\" atau \"Format file harus JPG, PNG, atau PDF\"."],
    ], [2.6 * cm, 13.8 * cm]))

    el.append(P("12.4 Ringkasan Endpoint Lain", "h3"))
    el.append(tabel([
        ["Endpoint", "Metode", "Fungsi"],
        ["/api/permohonan", "GET, POST", "Daftar & kirim permohonan warga"],
        ["/api/permohonan/[id]/pdf", "GET", "Unduh bukti pengajuan berformat PDF"],
        ["/api/skm", "POST", "Simpan jawaban survei (9 unsur, nilai 1–4)"],
        ["/api/admin/skm", "GET", "Rekap SKM: rata per unsur, Nilai IKM"],
        ["/api/admin/produk", "GET, POST", "Kelola dokumen publikasi"],
        ["/api/admin/demografi", "GET, POST", "Kelola data demografi"],
        ["/api/admin/users", "GET, POST", "Kelola akun"],
        ["/api/otp/send", "POST", "Kirim kode aktivasi via WhatsApp"],
        ["/api/ocr/ktp", "POST", "Baca NIK & nama dari foto KTP"],
        ["/api/tiket", "GET, POST", "Tiket bantuan (termasuk auto-tutup)"],
        ["/api/kunjungan", "POST", "Pencatat kunjungan halaman"],
    ], [5.2 * cm, 2.2 * cm, 9 * cm]))

    # ── 13. Akun demo ──────────────────────────────────────────────────────
    el.append(P("13. Akun Demo &amp; Catatan Pengembangan", "h1"))
    el.append(tabel([
        ["Akun", "Kata sandi", "Level", "Keterangan"],
        ["admin", "admin123", "1 — Super Admin", "Akun bawaan pengembangan"],
        ["1813010101900001", "warga123", "3 — Warga", "Akun warga contoh (Budi Warga)"],
        ["opd_dinkes", "—", "4 — Operator OPD", "Akun instansi contoh"],
    ], [4 * cm, 3 * cm, 4 * cm, 5.4 * cm]))
    el.append(P(
        "<b>Akun demo hanya untuk lingkungan pengembangan.</b> Pada server produksi, akun bawaan "
        "wajib dinonaktifkan atau diganti kata sandinya. Akun hasil migrasi portal lama memakai "
        "kata sandi masing-masing pemiliknya; kolom penyimpan kata sandi mentah yang ada pada "
        "portal lama sengaja tidak ikut dimigrasikan.", "kecil"))
    el.append(P(
        "Basis data hasil migrasi per 17 Juli 2026: 1.385 akun, 67 berita, 94 foto galeri, "
        "85 dokumen publikasi, 1.032 baris demografi (11 kecamatan &amp; 118 pekon), serta "
        "203 jawaban survei kepuasan.", "kecil"))
    return el
