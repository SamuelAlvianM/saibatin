"""Bagian I diperluas: cover gabungan, daftar isi gabungan, pembatas bagian,
dan bab cPanel/Passenger yang rinci (kebutuhan sistem untuk administrator)."""
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import cm
from reportlab.platypus import Image, PageBreak, Paragraph, Spacer, Table, TableStyle

import buat_pdf as B
from buat_pdf import P, tabel, gambar, S, BIRU, NAVY, ABU

JUDUL = "Dokumentasi Sistem & Panduan UI — Portal SAIBATIN Disdukcapil Kab. Pesisir Barat"


def sampul_gabungan():
    el = []
    logo = r"C:\sam\SAM-AMANDA-GALANG\saibatin\saibatin-platform\public\logo-saibatin.png"
    el.append(Spacer(1, 0.9 * cm))
    if os.path.exists(logo):
        im = Image(logo, width=3.0 * cm, height=4.35 * cm)
        im.hAlign = "CENTER"
        el.append(im)
    el.append(Spacer(1, 0.55 * cm))
    el.append(Paragraph("Dokumentasi Sistem<br/>&amp; Panduan UI", S["sampul_j"]))
    el.append(Spacer(1, 0.15 * cm))
    el.append(Paragraph(
        "PORTAL SAIBATIN — Disdukcapil Kabupaten Pesisir Barat<br/>Provinsi Lampung",
        S["sampul_s"]))
    el.append(Spacer(1, 0.6 * cm))
    el.append(tabel([
        ["Item", "Keterangan"],
        ["Nama sistem", "Portal SAIBATIN — layanan administrasi kependudukan &amp; pencatatan sipil"],
        ["Instansi", "Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat"],
        ["Menggantikan", "Portal lama berbasis Laravel/PHP (2022)"],
        ["Jenis aplikasi", "Aplikasi web Next.js (Node.js) — SSR + REST API, satu basis kode"],
        ["Basis data", "MySQL (server MySQL yang sudah tersedia di hosting)"],
        ["Runtime", "Node.js 18+ (teruji 20/22) via cPanel Application Manager (Passenger)"],
        ["Domain", "saibatin.pesisirbaratkab.go.id"],
        ["Status", "Selesai &amp; teruji; seluruh data lama termigrasi (1.385 akun, 11.897 permohonan)"],
        ["Versi dokumen", "18 Juli 2026 — v1"],
    ], [4.0 * cm, 12.4 * cm]))
    el.append(Spacer(1, 0.35 * cm))
    el.append(P(
        "Dokumen ini terdiri atas dua bagian. <b>Bagian I — Dokumentasi Sistem</b> ditujukan bagi "
        "administrator server: teknologi, arsitektur, kebutuhan sumber daya, dan langkah "
        "menjalankan aplikasi di cPanel. <b>Bagian II — Panduan UI &amp; Tahapan Fitur</b> "
        "menjelaskan tampilan dan cara pemakaian aplikasi bagi warga maupun petugas. Seluruh gambar "
        "diambil langsung dari aplikasi berjalan dengan data hasil migrasi — bukan mockup.", "kecil"))
    el.append(PageBreak())
    return el


def daftar_isi_gabungan():
    el = [P("Daftar Isi", "h1")]
    el.append(Paragraph("BAGIAN I — DOKUMENTASI SISTEM (untuk administrator server)", S["h3"]))
    el.append(tabel([
        ["Bab", "Isi"],
        ["1", "Ringkasan Eksekutif"],
        ["2", "Sistem yang Digunakan (Teknologi)"],
        ["3", "Arsitektur Aplikasi"],
        ["4", "Spesifikasi &amp; Kebutuhan Sumber Daya"],
        ["5", "Menjalankan di cPanel — Application Manager (Passenger), langkah demi langkah"],
        ["6", "Konfigurasi Lingkungan (.env)"],
        ["7", "Keamanan &amp; Privasi"],
        ["8", "Kebutuhan dari Administrator — Daftar Periksa"],
    ], [1.4 * cm, 15 * cm]))
    el.append(Spacer(1, 0.3 * cm))
    el.append(Paragraph("BAGIAN II — PANDUAN UI &amp; TAHAPAN FITUR (untuk warga &amp; petugas)", S["h3"]))
    el.append(tabel([
        ["Bab", "Isi"],
        ["1–3", "Identitas Visual, Galeri Tampilan, Peta Halaman Publik"],
        ["4", "Dokumentasi Halaman Publik — per halaman"],
        ["5–6", "Dashboard Admin &amp; Tutorial per Menu"],
        ["7–9", "Role Pengguna, Aksesibilitas, 17 Jenis Layanan"],
        ["10–13", "Pengaduan/WBS, Dokumen PDF, API, Akun Demo"],
        ["14–18", "Migrasi Data, Pemeliharaan, Notifikasi, Istilah, Pemecahan Masalah"],
        ["Lamp. A–F", "Wilayah, Demografi, Blok Konten, Dokumen, Formulir, Penerapan"],
    ], [1.4 * cm, 15 * cm]))
    el.append(PageBreak())
    return el


def _divider(nomor, judul, subjudul):
    """Halaman pembatas bagian besar."""
    el = [Spacer(1, 7 * cm)]
    st = TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 2, BIRU),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ])
    t = Table([[Paragraph(f"<font color='#2176bd'>{nomor}</font>", S["sampul_j"])]],
              colWidths=[16.4 * cm])
    t.setStyle(st)
    el.append(t)
    el.append(Spacer(1, 0.4 * cm))
    el.append(Paragraph(judul, ParagraphStyleCenterBold()))
    el.append(Spacer(1, 0.25 * cm))
    el.append(Paragraph(subjudul, S["cap"]))
    el.append(PageBreak())
    return el


def ParagraphStyleCenterBold():
    from reportlab.lib.styles import ParagraphStyle
    return ParagraphStyle("divh", fontName="Helvetica-Bold", fontSize=17,
                          textColor=NAVY, alignment=TA_CENTER, leading=22)


def bab_deploy_lengkap():
    """Bab 5-8: cara menjalankan di cPanel (rinci) + .env + keamanan + checklist admin."""
    el = []
    el.append(PageBreak())
    el.append(P("5. Menjalankan di cPanel — Application Manager (Passenger)", "h1"))
    el.append(P(
        "cPanel menyediakan jalur resmi menjalankan aplikasi Node.js melalui <b>Application "
        "Manager</b> (Tools → Software → Application Manager) yang memakai <b>Phusion Passenger</b>. "
        "Ini metode yang dianjurkan — bukan proses manual/cron — karena aplikasi terdaftar resmi, "
        "dijaga tetap hidup, dan menyala otomatis saat server boot (setara PHP-FPM untuk aplikasi "
        "PHP). Pada akun hosting SAIBATIN, Application Manager sudah tersedia dan siap menerima "
        "pendaftaran aplikasi."))

    el.append(P("5.1 Prasyarat", "h2"))
    el.append(tabel([
        ["Prasyarat", "Rincian"],
        ["Runtime Node.js", "Node.js 18 ke atas (ea-nodejs 18/20/22). Aplikasi teruji pada Node 20 &amp; 22."],
        ["Modul Passenger", "Passenger untuk Node aktif di Apache. Bila Deploy menolak, lengkapi paket EasyApache 4 <i>ea-ruby27-mod_passenger</i> (pendamping ea-nodejs)."],
        ["Basis data", "Satu basis data MySQL + satu pengguna (dibuat via MySQL Databases)."],
        ["Disk", "±1 GB (node_modules) + ±0,7 GB (berkas statis &amp; unggahan). Pastikan kuota akun mencukupi."],
        ["Berkas aplikasi", "Hasil build aplikasi + node_modules + folder public (disiapkan tim pengembang)."],
    ], [3.6 * cm, 12.8 * cm]))

    el.append(P("5.2 Langkah A — Siapkan Basis Data", "h2"))
    el.append(P(
        "1. Buka <b>MySQL Databases</b>, buat basis data (mis. <i>saibatinpesibar_saibatin</i>) dan "
        "seorang pengguna, lalu tautkan pengguna ke basis data dengan hak <b>ALL PRIVILEGES</b>.<br/>"
        "2. Buka <b>phpMyAdmin</b> → pilih basis data itu → tab <b>Import</b> → unggah berkas SQL "
        "(±5 MB) yang disediakan tim pengembang. Berkas ini sudah berisi seluruh data hasil migrasi "
        "(1.385 akun, 11.897 permohonan, dll).<br/>"
        "3. Catat nama basis data, nama pengguna, dan kata sandi — dipakai di berkas .env (Bab 6)."))

    el.append(P("5.3 Langkah B — Unggah Kode Aplikasi", "h2"))
    el.append(P(
        "Unggah berkas aplikasi ke sebuah direktori di dalam akun, mis. "
        "<b>/home/&lt;akun&gt;/saibatin-app</b> (di luar public_html). Tiga cara, pilih salah satu:"))
    el.append(tabel([
        ["Cara", "Langkah"],
        ["SSH / Terminal", "Kirim arsip via <i>scp</i>/<i>rsync</i> lalu ekstrak; atau <i>git clone</i> repositori lalu <i>npm ci</i> &amp; <i>npm run build</i> di server."],
        ["Git Version Control", "Tools → Git Version Control → Create → tempel URL repositori → clone ke direktori aplikasi."],
        ["File Manager", "Unggah arsip .zip melalui File Manager lalu Extract (untuk berkas besar, SSH lebih andal)."],
    ], [3.4 * cm, 13 * cm]))
    el.append(P(
        "Direktori aplikasi harus memuat berkas start-up Node (mis. <i>server.js</i>), folder "
        "<i>node_modules</i>, folder <i>public</i>, dan hasil build. Tim pengembang menyediakan "
        "struktur ini siap pakai.", "kecil"))

    el.append(P("5.4 Langkah C — Daftarkan di Application Manager", "h2"))
    el.append(P(
        "Buka <b>Application Manager → Register Application</b>, lalu isi persis seperti berikut:"))
    el.append(tabel([
        ["Kolom", "Nilai"],
        ["Application Name", "SAIBATIN"],
        ["Deployment Domain", "saibatin.pesisirbaratkab.go.id (satu-satunya domain akun ini)"],
        ["Application Path", "path direktori aplikasi dari Langkah B (mis. saibatin-app)"],
        ["Deployment Environment", "Production"],
        ["Application Startup File", "server.js (berkas start-up Node yang disediakan)"],
        ["Application URL", "/ (akar domain)"],
    ], [4.4 * cm, 12 * cm]))
    el.append(P(
        "<b>Peringatan penting:</b> domain <i>saibatin.pesisirbaratkab.go.id</i> adalah domain "
        "utama akun. Mendaftarkan aplikasi ke domain ini akan <b>menggantikan</b> apa pun yang "
        "sekarang disajikan di sana (mis. portal lama/placeholder). Pastikan hal ini memang "
        "dikehendaki, dan cadangkan situs lama bila perlu, sebelum menekan Deploy.", "kecil"))

    el.append(P("5.5 Langkah D — Variabel Lingkungan &amp; Deploy", "h2"))
    el.append(P(
        "Pada halaman aplikasi setelah terdaftar, tambahkan variabel lingkungan yang dibutuhkan "
        "(daftar lengkap di Bab 6) — minimal <i>DATABASE_URL</i>, <i>AUTH_SECRET</i>, dan "
        "<i>NODE_ENV=production</i> — lalu tekan <b>Deploy</b>. Passenger akan menjalankan aplikasi "
        "dan menautkannya ke domain. Buka domain di peramban untuk memverifikasi."))

    el.append(P("5.6 HTTPS / SSL", "h2"))
    el.append(P(
        "Setelah aplikasi berjalan, aktifkan HTTPS melalui <b>SSL/TLS Status</b> (AutoSSL cPanel) "
        "atau <b>Let's Encrypt</b> untuk domain resmi. Setelah HTTPS aktif, setel "
        "<i>AUTH_COOKIE_SECURE=true</i> dan <i>APP_URL</i>/<i>NEXT_PUBLIC_APP_URL</i> ke alamat "
        "https, lalu Deploy ulang agar kuki sesi &amp; metadata memakai HTTPS."))

    # 6. .env
    el.append(PageBreak())
    el.append(P("6. Konfigurasi Lingkungan (.env)", "h1"))
    el.append(P(
        "Aplikasi membaca konfigurasi dari variabel lingkungan (berkas <i>.env</i> di direktori "
        "aplikasi, atau kolom Environment Variables di Application Manager). Variabel bertanda "
        "<b>wajib</b> harus terisi; sisanya opsional (fitur terkait nonaktif bila kosong)."))
    el.append(tabel([
        ["Variabel", "Wajib", "Fungsi"],
        ["DATABASE_URL", "Ya", "URL koneksi MySQL: mysql://pengguna:sandi@127.0.0.1:3306/nama_db"],
        ["AUTH_SECRET", "Ya", "Kunci acak ≥32 karakter untuk menandatangani sesi login"],
        ["NODE_ENV", "Ya", "Setel ke production"],
        ["APP_URL", "Ya", "URL publik aplikasi (https domain resmi)"],
        ["NEXT_PUBLIC_APP_URL", "Ya", "URL publik untuk metadata/berbagi (sama dengan APP_URL)"],
        ["AUTH_COOKIE_SECURE", "Ya*", "true bila HTTPS; false hanya untuk uji tanpa SSL"],
        ["PORT", "—", "Port internal aplikasi (dikelola Passenger; default 3000)"],
        ["MAIL_HOST/PORT/USER/PASS", "Opsional", "SMTP untuk e-mail (kode aktivasi, atur ulang sandi)"],
        ["MAIL_FROM", "Opsional", "Nama &amp; alamat pengirim e-mail"],
        ["FONNTE_TOKEN", "Opsional", "Token WhatsApp (OTP). Kosong = OTP WhatsApp dilewati"],
        ["MASTER_PASSWORD", "Opsional", "Membuka halaman master; kosong = dinonaktifkan"],
        ["RECAPTCHA_V3_SECRET_KEY", "Opsional", "Anti-bot; kosong = verifikasi dilewati"],
        ["NEXT_PUBLIC_REGISTER_OPEN", "Opsional", "true = pendaftaran mandiri warga aktif; selain itu 'Segera Hadir'"],
    ], [4.6 * cm, 1.8 * cm, 10 * cm]))
    el.append(P(
        "*Wajib bernilai benar sesuai kondisi: <i>true</i> di produksi HTTPS. Bila disetel "
        "<i>false</i> saat situs sudah HTTPS, kuki sesi tak terkirim dan login gagal berulang.", "kecil"))

    # 7. Keamanan
    el.append(P("7. Keamanan &amp; Privasi", "h1"))
    el.append(tabel([
        ["Aspek", "Penerapan"],
        ["Kata sandi", "Hash bcrypt — tidak pernah dalam bentuk teks terbaca"],
        ["Akses basis data", "ORM Prisma dengan kueri terparameter (mencegah SQL injection)"],
        ["Sesi login", "Kuki bertanda tangan; opsi Secure aktif saat HTTPS"],
        ["Berkas unggahan", "Divalidasi jenis &amp; ukuran (maks 5 MB; JPG/PNG/PDF)"],
        ["Hak akses", "Berjenjang: warga, petugas, admin — menu &amp; aksi menyesuaikan peran"],
        ["Data pribadi", "NIK &amp; data warga hanya diakses akun berwenang; tidak diekspos publik"],
        ["Transport", "HTTPS penuh via SSL/TLS cPanel atau Let's Encrypt"],
    ], [3.4 * cm, 13 * cm]))

    # 8. Checklist admin
    el.append(P("8. Kebutuhan dari Administrator — Daftar Periksa", "h1"))
    el.append(P(
        "Sebagian besar langkah dikerjakan tim pengembang memakai akses akun hosting. Hal-hal "
        "berikut berada di ranah administrator server (bila belum terpenuhi):"))
    el.append(tabel([
        ["No", "Kebutuhan", "Status pada akun ini"],
        ["1", "cPanel Application Manager tersedia untuk akun", "Sudah tersedia"],
        ["2", "Runtime Node.js (ea-nodejs 18/20/22) terpasang", "Terpasang (ea-nodejs22)"],
        ["3", "Modul Passenger untuk Node aktif di Apache", "Perlu dikonfirmasi saat Deploy; bila kurang: pasang ea-ruby27-mod_passenger"],
        ["4", "Kuota disk akun mencukupi (±2 GB untuk aplikasi + aset)", "Perlu dikonfirmasi"],
        ["5", "Batas memori proses akun ≥ 512 MB", "Perlu dikonfirmasi (aplikasi pakai ±170–300 MB)"],
        ["6", "Akses SSH untuk unggah/kelola berkas aplikasi", "Tersedia (SSH Access)"],
        ["7", "SSL untuk domain resmi (AutoSSL / Let's Encrypt)", "Tersedia via SSL/TLS cPanel"],
    ], [1.0 * cm, 8.0 * cm, 7.4 * cm]))
    el.append(P(
        "Ringkasnya: aplikasi sudah selesai dan datanya siap; yang dibutuhkan dari sisi hosting "
        "hanyalah memastikan runtime Node.js berjalan lewat Application Manager (Passenger). Tim "
        "pengembang siap menyediakan berkas aplikasi &amp; basis data serta mendampingi proses "
        "pendaftaran.", "kecil"))
    return el
