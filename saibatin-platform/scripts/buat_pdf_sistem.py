"""Dokumentasi Sistem SAIBATIN untuk admin server.

Mengikuti gaya PANDUAN-UI-SAIBATIN (reportlab) tapi dibuka dengan bagian
teknis: Sistem yang Digunakan, Arsitektur, Sumber Daya, Cara Menjalankan di
cPanel (Application Manager / Passenger). Ditujukan ke pengelola hosting.
"""
import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import Image, PageBreak, Paragraph, Spacer

import buat_pdf as B
from buat_pdf import P, tabel, gambar, S, BIRU, NAVY

# Ganti judul running-header untuk dokumen ini (hal_header membaca B.JUDUL_DOK).
B.JUDUL_DOK = "Dokumentasi Sistem — Portal SAIBATIN Disdukcapil Kab. Pesisir Barat"

OUT = r"C:\sam\SAM-AMANDA-GALANG\saibatin\saibatin-platform\DOKUMENTASI-SISTEM-SAIBATIN.pdf"


def sampul():
    el = []
    logo = r"C:\sam\SAM-AMANDA-GALANG\saibatin\saibatin-platform\public\logo-saibatin.png"
    el.append(Spacer(1, 1.0 * cm))
    if os.path.exists(logo):
        im = Image(logo, width=3.0 * cm, height=4.35 * cm)
        im.hAlign = "CENTER"
        el.append(im)
    el.append(Spacer(1, 0.6 * cm))
    el.append(Paragraph("Dokumentasi Sistem", S["sampul_j"]))
    el.append(Spacer(1, 0.15 * cm))
    el.append(Paragraph(
        "PORTAL SAIBATIN — Disdukcapil Kabupaten Pesisir Barat<br/>Provinsi Lampung",
        S["sampul_s"]))
    el.append(Spacer(1, 0.7 * cm))
    el.append(tabel([
        ["Item", "Keterangan"],
        ["Nama sistem", "Portal SAIBATIN — layanan administrasi kependudukan &amp; pencatatan sipil"],
        ["Instansi", "Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat"],
        ["Menggantikan", "Portal lama berbasis Laravel/PHP (2022)"],
        ["Jenis aplikasi", "Aplikasi web Next.js (Node.js) — SSR + REST API, satu basis kode"],
        ["Status", "Selesai dibangun &amp; teruji; seluruh data lama sudah dimigrasikan"],
        ["Basis data", "MySQL (memakai server MySQL yang sudah tersedia di hosting)"],
        ["Runtime dibutuhkan", "Node.js 18+ (teruji pada Node 20/22) via cPanel Application Manager (Passenger)"],
        ["Domain", "saibatin.pesisirbaratkab.go.id"],
        ["Dokumen pendamping", "Panduan UI &amp; Tahapan Fitur (penggunaan aplikasi, 41 halaman)"],
        ["Ditujukan untuk", "Pengelola/administrator server hosting"],
        ["Versi dokumen", "18 Juli 2026 — v1"],
    ], [4.3 * cm, 12.1 * cm]))
    el.append(Spacer(1, 0.4 * cm))
    el.append(P(
        "Dokumen ini menjelaskan <b>teknologi, arsitektur, kebutuhan sumber daya, dan cara "
        "menjalankan</b> Portal SAIBATIN di lingkungan hosting cPanel — sebagai bahan bagi "
        "administrator server untuk menyiapkan runtime aplikasi. Ringkasan fitur dan hasil "
        "migrasi data disertakan di bagian akhir.", "kecil"))
    el.append(PageBreak())
    return el


def bab_teknis():
    el = []

    # 1. Ringkasan Eksekutif
    el.append(P("1. Ringkasan Eksekutif", "h1"))
    el.append(P(
        "Portal SAIBATIN adalah <b>pembaruan menyeluruh</b> portal layanan Disdukcapil Kabupaten "
        "Pesisir Barat, menggantikan portal lama berbasis Laravel (PHP) yang beroperasi sejak 2022. "
        "Aplikasi dibangun dengan kerangka kerja <b>Next.js (Node.js)</b> dan telah selesai serta "
        "teruji. Seluruh data portal lama sudah dimigrasikan penuh: 1.385 akun pengguna, 11.897 "
        "arsip permohonan layanan tahun 2022–2025, 1.456 berkas lampiran, berita, galeri, serta "
        "data demografi 11 kecamatan."))
    el.append(P(
        "Karena dibangun sebagai aplikasi Node.js, SAIBATIN memerlukan <b>runtime Node.js</b> yang "
        "dijalankan lewat jalur resmi cPanel, yaitu <b>Application Manager (Phusion Passenger)</b> — "
        "bukan proses manual. Basis data tetap memakai <b>MySQL</b> yang sudah tersedia di hosting. "
        "Kebutuhan sumber dayanya ringan: satu proses aplikasi berukuran ±170–300 MB memori, tanpa "
        "layanan realtime/WebSocket, dengan basis data hanya ±5 MB."))
    el.append(P(
        "Dokumen ini menyediakan seluruh informasi teknis yang diperlukan administrator untuk "
        "menyiapkan runtime tersebut. Prosedur pendaftaran aplikasi di Application Manager "
        "dijabarkan pada Bab 5.", "kecil"))

    # 2. Sistem yang Digunakan
    el.append(P("2. Sistem yang Digunakan (Teknologi)", "h1"))
    el.append(P(
        "Seluruh komponen berikut bersifat standar industri, sumber terbuka, dan lazim didukung "
        "di lingkungan hosting cPanel modern."))
    el.append(P("2.1 Sisi Aplikasi", "h2"))
    el.append(tabel([
        ["Komponen", "Teknologi / Versi", "Fungsi"],
        ["Kerangka kerja", "Next.js 16 (App Router)", "Kerangka web React: render sisi server (SSR), routing, dan REST API dalam satu basis kode"],
        ["Runtime", "Node.js 18+ (teruji Node 20 &amp; 22)", "Menjalankan aplikasi di server"],
        ["Pustaka UI", "React 19", "Antarmuka pengguna berbasis komponen"],
        ["Bahasa", "TypeScript", "JavaScript bertipe — mengurangi kesalahan"],
        ["Penataan gaya", "Tailwind CSS 4", "Sistem desain / gaya tampilan"],
        ["ORM basis data", "Prisma 6", "Lapisan akses basis data yang aman (mencegah SQL injection)"],
        ["Peta", "Leaflet 1.9", "Peta GIS sebaran penduduk &amp; lokasi kantor"],
        ["Pengolah gambar", "sharp 0.35", "Optimasi/ubah ukuran gambar unggahan"],
        ["OCR KTP", "Tesseract (tessdata)", "Membaca NIK &amp; nama dari foto KTP"],
    ], [3.2 * cm, 4.5 * cm, 8.7 * cm]))
    el.append(P("2.2 Sisi Server &amp; Data", "h2"))
    el.append(tabel([
        ["Komponen", "Teknologi", "Keterangan"],
        ["Basis data", "MySQL / MariaDB", "Memakai server MySQL yang sudah tersedia di hosting; ukuran data ±5 MB"],
        ["Manajer proses", "Phusion Passenger", "Via cPanel Application Manager — menjaga aplikasi tetap hidup &amp; restart otomatis"],
        ["Web server", "Apache (cPanel)", "Passenger terintegrasi dengan Apache bawaan cPanel"],
        ["Berkas statis", "Sistem berkas hosting", "Gambar berita/galeri &amp; dokumen PDF publikasi"],
        ["Notifikasi", "SMTP (e-mail) + Fonnte (WhatsApp)", "Kode aktivasi &amp; pemberitahuan; opsional"],
    ], [3.2 * cm, 4.5 * cm, 8.7 * cm]))

    # 3. Arsitektur
    el.append(PageBreak())
    el.append(P("3. Arsitektur Aplikasi", "h1"))
    el.append(P(
        "SAIBATIN adalah aplikasi <b>monolitik</b> — satu proses Node.js menangani halaman web "
        "sekaligus REST API-nya. Tidak ada layanan terpisah, antrean pesan, maupun koneksi "
        "realtime yang perlu dikelola. Alur permintaan warga:"))
    el.append(tabel([
        ["Lapisan", "Peran"],
        ["Peramban warga / petugas", "Mengakses https://saibatin.pesisirbaratkab.go.id"],
        ["Apache + Passenger (cPanel)", "Menerima permintaan HTTPS, meneruskan ke proses Node.js aplikasi"],
        ["Proses Node.js (Next.js)", "Merender halaman, memproses formulir, menjalankan REST API"],
        ["Prisma (ORM)", "Menerjemahkan operasi aplikasi menjadi kueri SQL yang aman"],
        ["MySQL", "Menyimpan data: akun, permohonan, berkas, demografi, dll."],
        ["Sistem berkas", "Menyimpan berkas fisik (gambar, PDF) di direktori unggahan"],
    ], [5.4 * cm, 11 * cm]))
    el.append(P(
        "Karena Passenger yang menghidupkan dan menjaga proses Node, aplikasi otomatis menyala saat "
        "server boot dan otomatis dijalankan ulang bila berhenti — sama seperti pola PHP-FPM untuk "
        "aplikasi PHP. Inilah alasan jalur Application Manager dipilih, bukan proses manual.",
        "kecil"))

    # 4. Sumber daya
    el.append(P("4. Spesifikasi &amp; Kebutuhan Sumber Daya", "h1"))
    el.append(tabel([
        ["Sumber daya", "Kebutuhan", "Catatan"],
        ["Memori (RAM)", "±170–300 MB per proses", "Satu proses aplikasi; setara aplikasi PHP menengah"],
        ["CPU", "Ringan", "Beban puncak hanya saat render halaman; idle mendekati 0%"],
        ["Basis data", "±5 MB", "MySQL; tumbuh perlahan seiring permohonan baru"],
        ["Disk — dependensi", "±1 GB", "Folder node_modules (pustaka Node), dipasang sekali via npm"],
        ["Disk — berkas statis", "±0,7 GB", "Gambar berita/galeri &amp; dokumen PDF publikasi hasil migrasi"],
        ["Node.js", "versi 18 ke atas", "cPanel ea-nodejs (18/20/22) mencukupi; teruji pada 20 &amp; 22"],
        ["Realtime/WebSocket", "Tidak dipakai", "Tidak ada koneksi persisten; tidak perlu port khusus"],
        ["Port publik tambahan", "Tidak perlu", "Passenger menautkan aplikasi ke domain lewat Apache"],
    ], [3.4 * cm, 4.2 * cm, 8.8 * cm]))
    el.append(P(
        "Jejak sumber daya ini setara aplikasi PHP kelas menengah. Tidak diperlukan VPS terpisah, "
        "kontainer, maupun perangkat lunak tambahan di luar yang sudah disediakan cPanel.", "kecil"))

    return el


def bab_deploy():
    el = []
    el.append(PageBreak())
    el.append(P("5. Menjalankan di cPanel — Application Manager (Passenger)", "h1"))
    el.append(P(
        "cPanel menyediakan jalur resmi menjalankan aplikasi Node.js melalui <b>Application "
        "Manager</b> (Tools → Software → Application Manager), yang memakai <b>Phusion Passenger</b>. "
        "Ini metode yang dianjurkan — bukan menjalankan proses manual — karena aplikasi terdaftar "
        "resmi, dijaga tetap hidup, dan menyala otomatis saat boot."))
    el.append(P(
        "<b>Prasyarat</b> (disiapkan tim pengembang, di luar wewenang administrator): kode aplikasi "
        "yang sudah dibangun beserta dependensinya diunggah ke direktori pada akun hosting, basis "
        "data MySQL dibuat &amp; diisi, dan berkas konfigurasi lingkungan (.env) diisi.", "kecil"))
    el.append(P("5.1 Langkah Ringkas", "h2"))
    el.append(tabel([
        ["No", "Langkah"],
        ["1", "Buat basis data MySQL + pengguna via <b>MySQL Databases</b>, lalu impor berkas data (±5 MB) melalui <b>phpMyAdmin</b>."],
        ["2", "Unggah kode aplikasi (hasil build + node_modules + berkas statis) ke direktori mis. <b>/home/&lt;akun&gt;/saibatin-app</b> — via SSH/Terminal atau Git."],
        ["3", "Isi berkas <b>.env</b> (kredensial DB, kunci sesi, URL domain) di direktori aplikasi."],
        ["4", "Buka <b>Application Manager → Register Application</b>."],
        ["5", "Isi: <i>Application Name</i> = SAIBATIN; <i>Deployment Domain</i> = saibatin.pesisirbaratkab.go.id; <i>Application Path</i> = direktori pada langkah 2; <i>Environment</i> = Production."],
        ["6", "Tetapkan berkas start-up Node (mis. <i>server.js</i>) &amp; variabel lingkungan bila diminta, lalu <b>Deploy</b>."],
        ["7", "Passenger menjalankan aplikasi &amp; menautkannya ke domain. Verifikasi dengan membuka domain di peramban."],
    ], [1.1 * cm, 15.3 * cm]))
    el.append(P(
        "<b>Catatan untuk administrator:</b> pada akun hosting SAIBATIN, Application Manager sudah "
        "tersedia dan siap menerima pendaftaran aplikasi (Passenger aktif). Bila saat Deploy muncul "
        "pesan bahwa modul Passenger untuk Node belum lengkap, paket resmi cPanel/EasyApache 4 "
        "<i>ea-ruby27-mod_passenger</i> (pendamping ea-nodejs yang sudah terpasang) melengkapinya. "
        "Selain itu tidak ada konfigurasi khusus yang diperlukan.", "kecil"))

    el.append(P("6. Keamanan &amp; Privasi", "h1"))
    el.append(tabel([
        ["Aspek", "Penerapan"],
        ["Kata sandi", "Disimpan sebagai hash bcrypt — tidak pernah dalam bentuk teks terbaca"],
        ["Akses basis data", "Melalui ORM Prisma dengan kueri terparameter (mencegah SQL injection)"],
        ["Sesi login", "Kuki bertanda tangan; opsi <i>Secure</i> aktif saat HTTPS"],
        ["Berkas unggahan", "Divalidasi jenis &amp; ukuran (maks 5 MB; JPG/PNG/PDF)"],
        ["Hak akses", "Berjenjang: warga, petugas, admin — menu &amp; aksi menyesuaikan peran"],
        ["Transport", "Mendukung HTTPS penuh (sertifikat via SSL/TLS cPanel atau Let's Encrypt)"],
        ["Data pribadi", "NIK &amp; data warga hanya diakses akun berwenang; tidak diekspos ke publik"],
    ], [3.4 * cm, 13 * cm]))
    return el


def bab_migrasi_fitur():
    el = []
    el.append(PageBreak())
    el.append(P("7. Hasil Migrasi Data Portal Lama", "h1"))
    el.append(P(
        "Seluruh data portal lama telah dipindahkan ke basis data baru lewat skrip migrasi yang "
        "terdokumentasi (dapat ditelusuri &amp; diulang). Ringkasan isi basis data saat ini:"))
    el.append(tabel([
        ["Data", "Jumlah", "Keterangan"],
        ["Akun pengguna", "1.385", "1.378 akun warga/petugas hasil migrasi + 7 akun sistem; kata sandi lama tetap berlaku"],
        ["Arsip permohonan", "11.897", "Permohonan layanan 2022–2025"],
        ["Berkas lampiran", "1.456", "Dokumen pendukung permohonan"],
        ["Berita", "67", "Beserta gambar"],
        ["Galeri", "94", "Foto kegiatan"],
        ["Dokumen publikasi", "85", "Produk hukum, formulir &amp; persyaratan, LHKPN"],
        ["Data demografi", "1.032", "8 kategori × 11 kecamatan + 118 pekon"],
        ["Wilayah", "129", "11 kecamatan + 118 pekon (kode 1813)"],
        ["Jenis layanan", "17", "Layanan Capil &amp; Dafduk"],
        ["Survei kepuasan (SKM)", "203", "Skala Permenpan RB 14/2017 (9 unsur, 1–4); IKM 90,92 (mutu A)"],
    ], [3.8 * cm, 2.2 * cm, 10.4 * cm]))
    el.append(P(
        "Migrasi menjaga integritas identitas daerah: seluruh wilayah berkode 1813 (Pesisir Barat), "
        "dan dokumen arsip yang ternyata milik daerah lain sengaja tidak diterbitkan.", "kecil"))

    el.append(P("8. Ikhtisar Fitur Aplikasi", "h1"))
    el.append(P(
        "Berikut ikhtisar singkat; penjelasan lengkap tiap halaman ada pada dokumen pendamping "
        "<i>Panduan UI &amp; Tahapan Fitur</i>."))
    el.append(tabel([
        ["Kelompok", "Fitur"],
        ["Layanan warga", "Permohonan online 17 jenis layanan (wizard bertahap), unggah/pindai berkas dengan bantuan OCR KTP, riwayat &amp; unduh bukti PDF, tiket bantuan"],
        ["Informasi publik", "Berita, galeri, GIS &amp; peta kantor, laporan demografi, produk hukum &amp; formulir, PPID, kebijakan privasi"],
        ["Partisipasi", "Pengaduan masyarakat sekaligus WBS, kritik &amp; saran, Survei Kepuasan Masyarakat (SKM/IKM)"],
        ["Dashboard petugas", "Proses permohonan, layani warga di loket, kelola konten/berita/galeri/dokumen/demografi, manajemen akun, rekap SKM"],
        ["Aksesibilitas", "Widget disabilitas: skala teks, kontras, baca teks (text-to-speech) berbahasa Indonesia"],
    ], [3.2 * cm, 13.2 * cm]))
    el.extend(gambar("01-beranda-hero",
                     "Beranda Portal SAIBATIN — identitas Kabupaten Pesisir Barat.", 14 * cm))
    el.extend(gambar("41-skm-admin",
                     "Dashboard SKM — Indeks Kepuasan Masyarakat 90,92 (mutu A) dari 203 responden, standar Permenpan.", 14 * cm))

    el.append(P("Penutup", "h1"))
    el.append(P(
        "Portal SAIBATIN telah selesai dibangun, seluruh data lama telah dimigrasikan, dan aplikasi "
        "siap dijalankan. Satu-satunya kebutuhan dari sisi hosting adalah menyiapkan runtime Node.js "
        "melalui Application Manager (Passenger) sebagaimana dijabarkan pada Bab 5. Tim pengembang "
        "siap menyediakan berkas aplikasi, berkas basis data, serta mendampingi proses pendaftaran "
        "aplikasi bila diperlukan."))
    return el


def build():
    from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate
    doc = BaseDocTemplate(
        OUT, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=1.75 * cm, bottomMargin=1.5 * cm,
        title="Dokumentasi Sistem — Portal SAIBATIN",
        author="Disdukcapil Kabupaten Pesisir Barat",
        subject="Dokumentasi sistem, arsitektur & kebutuhan runtime Portal SAIBATIN",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="n")
    doc.addPageTemplates([PageTemplate(id="utama", frames=[frame], onPage=B.hal_header)])
    cerita = sampul() + bab_teknis() + bab_deploy() + bab_migrasi_fitur()
    doc.build(cerita)
    import pypdf
    r = pypdf.PdfReader(OUT)
    img = sum(len(p.images) for p in r.pages)
    print(f"PDF: {OUT}")
    print(f"  halaman: {len(r.pages)} | gambar: {img} | ukuran: {os.path.getsize(OUT)/1024/1024:.1f} MB")


if __name__ == "__main__":
    build()
