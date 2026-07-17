"""Bangun PANDUAN-UI-SAIBATIN.pdf — mengikuti model PANDUAN-UI-SIDAKO.pdf (KTT)
tapi untuk Portal SAIBATIN Disdukcapil Kab. Pesisir Barat, dengan cakupan lebih rinci.
"""
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (BaseDocTemplate, Frame, Image, KeepTogether,
                                NextPageTemplate, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)

HERE = os.path.dirname(os.path.abspath(__file__))
# gambar terkompresi (JPEG 1600px) — PNG 2880px membengkakkan PDF jadi ~26 MB
SHOTS = os.path.join(HERE, "shots_kecil")
OUT = r"C:\sam\SAM-AMANDA-GALANG\saibatin\saibatin-platform\PANDUAN-UI-SAIBATIN.pdf"

BIRU = colors.HexColor("#2176bd")
NAVY = colors.HexColor("#1b4b72")
ABU = colors.HexColor("#64748b")
ABU_MUDA = colors.HexColor("#f1f5f9")
GARIS = colors.HexColor("#cbd5e1")

JUDUL_DOK = "Panduan UI & Tahapan Fitur — Portal SAIBATIN Disdukcapil Kab. Pesisir Barat"

ss = getSampleStyleSheet()
S = {
    "h1": ParagraphStyle("h1", parent=ss["Heading1"], fontName="Helvetica-Bold",
                         fontSize=15, textColor=NAVY, spaceBefore=14, spaceAfter=8),
    "h2": ParagraphStyle("h2", parent=ss["Heading2"], fontName="Helvetica-Bold",
                         fontSize=11.5, textColor=BIRU, spaceBefore=10, spaceAfter=5),
    "h3": ParagraphStyle("h3", parent=ss["Heading3"], fontName="Helvetica-Bold",
                         fontSize=9.8, textColor=NAVY, spaceBefore=7, spaceAfter=3),
    "p": ParagraphStyle("p", parent=ss["BodyText"], fontName="Helvetica", fontSize=8.9,
                        leading=13.2, alignment=TA_JUSTIFY, spaceAfter=5),
    "kecil": ParagraphStyle("kecil", parent=ss["BodyText"], fontName="Helvetica",
                            fontSize=7.7, leading=10.5, textColor=ABU, spaceAfter=3),
    "cap": ParagraphStyle("cap", parent=ss["BodyText"], fontName="Helvetica-Oblique",
                          fontSize=7.6, leading=10, textColor=ABU, alignment=TA_CENTER,
                          spaceBefore=2, spaceAfter=9),
    "sel": ParagraphStyle("sel", parent=ss["BodyText"], fontName="Helvetica", fontSize=7.8,
                          leading=10.4, spaceAfter=0),
    "selb": ParagraphStyle("selb", parent=ss["BodyText"], fontName="Helvetica-Bold",
                           fontSize=7.8, leading=10.4, textColor=colors.white, spaceAfter=0),
    "sampul_j": ParagraphStyle("sj", parent=ss["Title"], fontName="Helvetica-Bold",
                               fontSize=26, textColor=NAVY, alignment=TA_CENTER, leading=31),
    "sampul_s": ParagraphStyle("sst", parent=ss["Title"], fontName="Helvetica",
                               fontSize=13, textColor=BIRU, alignment=TA_CENTER, leading=18),
}


def P(t, s="p"):
    return Paragraph(t, S[s])


def hal_header(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 6.8)
    canvas.setFillColor(ABU)
    canvas.drawString(2 * cm, A4[1] - 1.15 * cm, JUDUL_DOK)
    canvas.drawRightString(A4[0] - 2 * cm, A4[1] - 1.15 * cm, f"Hal. {doc.page}")
    canvas.setStrokeColor(GARIS)
    canvas.setLineWidth(0.4)
    canvas.line(2 * cm, A4[1] - 1.3 * cm, A4[0] - 2 * cm, A4[1] - 1.3 * cm)
    canvas.setFillColor(BIRU)
    canvas.rect(0, 0, A4[0], 0.32 * cm, stroke=0, fill=1)
    canvas.restoreState()


def tabel(data, lebar, header=True):
    rows = []
    for i, r in enumerate(data):
        if header and i == 0:
            rows.append([Paragraph(f"<b>{c}</b>", S["selb"]) for c in r])
        else:
            rows.append([Paragraph(str(c), S["sel"]) for c in r])
    t = Table(rows, colWidths=lebar, repeatRows=1 if header else 0)
    st = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, GARIS),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    if header:
        st += [("BACKGROUND", (0, 0), (-1, 0), BIRU),
               ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ABU_MUDA])]
    else:
        st += [("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, ABU_MUDA])]
    t.setStyle(TableStyle(st))
    return t


def gambar(nama, cap, lebar=16.4 * cm):
    p = os.path.join(SHOTS, nama + ".jpg")
    if not os.path.exists(p):
        return [P(f"<i>[gambar {nama} tidak tersedia]</i>", "kecil")]
    from PIL import Image as PILImage
    with PILImage.open(p) as im:
        w, h = im.size
    tinggi = lebar * h / w
    maks = 20.5 * cm
    if tinggi > maks:
        tinggi = maks
        lebar = tinggi * w / h
    img = Image(p, width=lebar, height=tinggi)
    img.hAlign = "CENTER"
    return [img, Paragraph(cap, S["cap"])]


def sampul():
    el = []
    logo = r"C:\sam\SAM-AMANDA-GALANG\saibatin\saibatin-platform\public\logo-saibatin.png"
    el.append(Spacer(1, 1.1 * cm))
    if os.path.exists(logo):
        im = Image(logo, width=3.1 * cm, height=4.5 * cm)
        im.hAlign = "CENTER"
        el.append(im)
    el.append(Spacer(1, 0.7 * cm))
    el.append(Paragraph("Panduan UI &amp; Tahapan Fitur", S["sampul_j"]))
    el.append(Spacer(1, 0.2 * cm))
    el.append(Paragraph("PORTAL SAIBATIN — Disdukcapil Kabupaten Pesisir Barat<br/>Provinsi Lampung",
                        S["sampul_s"]))
    el.append(Spacer(1, 0.9 * cm))
    el.append(tabel([
        ["Item", "Keterangan"],
        ["Nama aplikasi", "Portal SAIBATIN (saibatin-platform)"],
        ["Instansi", "Dinas Kependudukan dan Pencatatan Sipil Kabupaten Pesisir Barat"],
        ["Alamat kantor", "Kompleks Perkantoran Pemda, Way Redak, Krui, Kec. Pesisir Tengah"],
        ["Kode wilayah", "1813 (Provinsi Lampung — 18)"],
        ["Zona waktu", "WIB (Asia/Jakarta)"],
        ["Domain resmi", "saibatin.pesisirbaratkab.go.id"],
        ["Alamat pengembangan", "http://localhost:3000"],
        ["Teknologi", "Next.js 16 (App Router), Prisma + MySQL, Tailwind CSS 4, Leaflet"],
        ["Tema warna", "Biru #2176BD (utama) &amp; Navy #1B4B72 (gradasi/kontras)"],
        ["Cakupan wilayah", "11 kecamatan, 118 pekon/kelurahan"],
        ["Versi dokumen", "17 Juli 2026 — v1 (panduan perdana Portal SAIBATIN, disusun "
                          "mengikuti struktur panduan Portal KTT dengan cakupan diperluas: "
                          "SKM standar Permenpan, dokumen publikasi hasil migrasi portal lama, "
                          "dan penjelasan produk berformat)"],
    ], [4.4 * cm, 12 * cm]))
    el.append(Spacer(1, 0.5 * cm))
    el.append(P(
        "Dokumen ini menjelaskan tampilan (UI) dan tahapan pemakaian Portal SAIBATIN untuk dua "
        "sudut pandang: <b>warga</b> sebagai pengguna layanan, dan <b>petugas/admin</b> sebagai "
        "pengelola. Seluruh gambar diambil langsung dari aplikasi yang berjalan dengan data hasil "
        "migrasi portal lama — bukan mockup.", "kecil"))
    el.append(PageBreak())
    return el


def isi_dokumen():
    el = []

    # ── 1. Identitas Visual ────────────────────────────────────────────────
    el.append(P("1. Identitas Visual (Branding)", "h1"))
    el.append(P(
        "Portal resmi bernama <b>SAIBATIN</b> — portal layanan Dinas Kependudukan dan Pencatatan "
        "Sipil Kabupaten Pesisir Barat, Provinsi Lampung. Nama SAIBATIN diambil dari khazanah adat "
        "Lampung Pesisir. Identitas yang dipakai konsisten di seluruh aplikasi: lambang daerah "
        "Pesisir Barat (bermotto <i>Helauni Kibaghong</i>), nama portal SAIBATIN, alamat kantor "
        "(Way Redak, Krui, Kec. Pesisir Tengah), zona waktu WIB, kode wilayah 1813, serta domain "
        "resmi pesisirbaratkab.go.id."))
    el.append(P("Palet Warna", "h2"))
    el.append(tabel([
        ["Warna", "Kode", "Penggunaan"],
        ["Biru SAIBATIN", "#2176BD", "Warna utama: navbar glassy, tombol utama, ikon, tautan, gradasi hero"],
        ["Navy", "#1B4B72", "Pasangan gradasi hero/tombol, teks judul, sisi gelap grafik"],
        ["Biru muda", "#6CB2EB", "Ujung terang gradasi batang grafik statistik"],
        ["Slate 50/100", "#F8FAFC / #F1F5F9", "Latar halaman, baris tabel berselang"],
        ["Emerald", "#10B981", "Status selesai, indikator jam layanan sedang buka"],
        ["Amber", "#F59E0B", "Status menunggu/diproses, kartu statistik Kepala Keluarga"],
        ["Merah", "#EF4444", "Status ditolak, aksi hapus, peringatan"],
    ], [3.1 * cm, 3.1 * cm, 10.2 * cm]))
    el.append(P(
        "<b>Catatan penting:</b> portal ini pernah dipakai sebagai dasar portal daerah lain "
        "(Portal KTT/SIDAKO Kab. Tana Tidung yang bertema amber). Seluruh identitas SAIBATIN — "
        "warna biru, lambang Pesisir Barat, WIB, kode 1813 — wajib dipertahankan dan tidak boleh "
        "tertukar dengan identitas daerah lain.", "kecil"))

    el.append(P("2. Galeri Tampilan (Screenshot)", "h1"))
    for nama, cap in [
        ("01-beranda-hero", "Beranda — hero pencarian layanan dengan gradasi biru dan pintasan layanan populer."),
        ("03-login", "Halaman Login — kartu glass dengan lambang Pesisir Barat; masuk memakai NIK (warga) atau username (petugas/OPD)."),
        ("06-permohonan-online", "Permohonan Online — kartu layanan yang sedang ditampilkan; klik kartu untuk membuka wizard formulir. "
                                 "Portal menyediakan 17 jenis layanan, namun admin dapat menyembunyikan sebagian (lihat bab 4.3)."),
        ("07-pengaduan-wbs", "Pengaduan Masyarakat &amp; WBS — satu kanal untuk pengaduan layanan sekaligus pelaporan pelanggaran; identitas pelapor dirahasiakan."),
        ("09-hubungi-kami", "Hubungi Kami — kartu alamat, jam layanan (WIB), dan peta kantor Krui."),
        ("12-galeri", "Galeri — dokumentasi kegiatan hasil migrasi portal lama (94 foto)."),
    ]:
        el.extend(gambar(nama, cap))

    # ── 3. Peta halaman publik ─────────────────────────────────────────────
    el.append(PageBreak())
    el.append(P("3. Peta Halaman Publik (Warga)", "h1"))
    el.append(tabel([
        ["Halaman", "URL", "Fungsi"],
        ["Beranda", "/", "Hero pencarian layanan, carousel, kartu statistik demografi, alur layanan, berita terbaru, peta kantor"],
        ["Login", "/login", "Masuk memakai NIK (warga) atau username (instansi/staf)"],
        ["Register", "/register", "Pendaftaran akun warga dengan verifikasi OTP WhatsApp"],
        ["Lupa Password", "/forgot-password", "Kirim tautan atur ulang kata sandi"],
        ["Permohonan Online", "/permohonan-online", "Grid 17 jenis layanan → wizard formulir bertahap"],
        ["Riwayat", "/riwayat", "Daftar & detail permohonan milik warga, unduh bukti PDF"],
        ["Tiket Bantuan", "/tiket", "Tanya-jawab dengan petugas (auto-tutup bila tidak ada aktivitas)"],
        ["Profil", "/profil", "Ubah data diri & ganti kata sandi"],
        ["Pengaduan &amp; WBS", "/pengaduan", "Pengaduan layanan sekaligus Whistle Blowing System"],
        ["Kritik &amp; Saran", "/hubungi-kami/kritik-saran", "Masukan singkat untuk perbaikan layanan"],
        ["Hubungi Kami", "/hubungi-kami", "Alamat, jam layanan, peta, dan form Survei Kepuasan (SKM)"],
        ["Berita", "/media/berita", "67 berita hasil migrasi portal lama"],
        ["Galeri", "/galeri", "94 foto kegiatan"],
        ["GIS Penduduk", "/media/gis", "Peta sebaran penduduk per kecamatan (Leaflet)"],
        ["Peta Kantor", "/media/peta", "Titik lokasi kantor dinas"],
        ["Laporan Demografi", "/media/demografi", "8 kategori data demografi per kecamatan &amp; pekon"],
        ["Produk Disdukcapil", "/produk/produk-disdukcapil", "12 produk layanan + persyaratan lengkap"],
        ["Formulir &amp; Persyaratan", "/produk/formulir-persyaratan", "46 formulir baku yang dapat diunduh"],
        ["Produk Hukum", "/produk/hukum", "38 peraturan (UU, PP, Perpres, Permendagri, SE)"],
        ["SOP", "/produk/sop", "Standar Operasional Prosedur pelayanan"],
        ["PPID", "/ppid/…", "Informasi publik berkala &amp; setiap saat, LHKPN, laporan"],
        ["WBS", "/wbs/tentang-wbs, /wbs/form-pengaduan", "Halaman rujukan WBS (kanal utamanya di /pengaduan)"],
        ["Peta Situs", "/sitemap", "Daftar seluruh halaman portal"],
        ["Legal", "/privasi, /syarat", "Kebijakan privasi &amp; syarat penggunaan"],
    ], [3.3 * cm, 4.3 * cm, 8.8 * cm]))

    # ── 4. Dokumentasi halaman publik ──────────────────────────────────────
    el.append(PageBreak())
    el.append(P("4. Dokumentasi Halaman Publik — per Halaman", "h1"))

    el.append(P("4.1 Beranda (/) — bagian demi bagian", "h2"))
    el.append(tabel([
        ["Bagian", "Isi &amp; perilaku"],
        ["Hero", "Judul besar “Layanan Kependudukan Kabupaten Pesisir Barat”, kolom pencarian layanan, pintasan Akta Kelahiran/KTP-el/KK/KIA/Pindah Datang. Teks judul dapat diubah admin lewat blok konten <i>beranda.hero</i>."],
        ["Carousel", "Slide gambar pengumuman; kosong secara bawaan, diisi lewat blok <i>beranda.carousel</i>."],
        ["Kartu statistik", "6 kartu bawaan (penduduk, KK, wajib KTP, dst) yang menarik angka dari data demografi. Kartu dapat diubah kategori/kolom/warna, dan direset ke bawaan oleh akun master."],
        ["Alur layanan", "Ilustrasi 4 langkah: daftar → ajukan → diproses → dokumen selesai."],
        ["Berita terbaru", "3 berita terbaru dari 67 berita hasil migrasi."],
        ["Peta kantor", "Peta Leaflet titik kantor dinas + status jam layanan (buka/tutup) ala Google Maps."],
    ], [3.3 * cm, 13.1 * cm]))
    el.extend(gambar("02-beranda-penuh", "Beranda penuh — seluruh bagian dari hero sampai peta kantor.", 11.6 * cm))

    el.append(P("4.2 Register (/register) &amp; Login", "h2"))
    el.append(P(
        "Warga mendaftar memakai NIK sebagai User ID. Sistem mengirim kode aktivasi (OTP) melalui "
        "WhatsApp (Fonnte) dan e-mail. Setelah aktif, warga login memakai NIK + kata sandi. "
        "Petugas dan instansi OPD login memakai <i>username</i>, bukan NIK. "
        "<b>Akun hasil migrasi portal lama tetap dapat login memakai kata sandi lamanya</b> — "
        "hash bcrypt dibawa utuh dari portal lama."))
    el.extend(gambar("04-register", "Register — pendaftaran warga dengan verifikasi OTP WhatsApp.", 13.5 * cm))

    el.append(P("4.3 Permohonan Online — wizard formulir", "h2"))
    el.append(P(
        "Portal menyediakan <b>17 jenis layanan</b> (kategori Capil &amp; Dafduk) — rinciannya ada "
        "di bab 9. Mengklik kartu membuka wizard bertahap: isi data → unggah berkas → tinjau → "
        "kirim. Berkas dapat diunggah dari galeri atau dipindai langsung memakai kamera (OCR KTP "
        "membantu mengisi NIK &amp; nama otomatis)."))
    el.append(P(
        "<b>Visibilitas layanan.</b> Tidak semua jenis layanan harus tampil sekaligus. Admin dapat "
        "menyembunyikan layanan yang belum siap dilayani daring lewat blok konten "
        "<i>pelayanan.visibilitas</i> (Dashboard → Konten Halaman). Pada tangkapan layar di bawah, "
        "<b>11 dari 17 layanan sedang disembunyikan</b> sehingga hanya sebagian kartu yang tampak — "
        "ini perilaku normal, bukan kesalahan. Untuk menampilkan kembali, keluarkan kode layanan "
        "yang bersangkutan dari daftar <i>hidden</i>."))
    el.extend(gambar("06-permohonan-online", "Permohonan Online — kartu layanan yang aktif ditampilkan (11 dari 17 layanan sedang disembunyikan lewat pengaturan visibilitas).", 14.5 * cm))

    el.append(P("4.4 Riwayat &amp; Tiket Bantuan", "h2"))
    el.append(P(
        "<b>/riwayat</b> menampilkan seluruh permohonan warga beserta statusnya (Menunggu, "
        "Diproses, Selesai, Ditolak) dan tombol unduh bukti pengajuan berformat PDF. "
        "<b>/tiket</b> adalah kanal tanya-jawab dengan petugas; tiket tertutup otomatis bila tidak "
        "ada aktivitas selama tenggang yang diatur di konfigurasi."))
    el.extend(gambar("44-riwayat", "Riwayat permohonan warga beserta status dan unduhan bukti PDF.", 14.5 * cm))

    el.append(P("4.5 Produk Disdukcapil, Formulir &amp; Produk Hukum", "h2"))
    el.append(P(
        "<b>/produk/produk-disdukcapil</b> memuat 12 produk layanan dalam bentuk akordeon; tiap "
        "produk menampilkan gambar, nama, penjelasan, dan <b>daftar persyaratan lengkap</b> hasil "
        "migrasi portal lama. Tautan “download formulir” di dalam penjelasan mengarah ke halaman "
        "Formulir &amp; Persyaratan. <b>/produk/formulir-persyaratan</b> memuat 46 formulir baku "
        "(F-1.01 sampai F-2.13 serta aneka surat pernyataan). <b>/produk/hukum</b> memuat 38 "
        "produk hukum nasional."))
    el.extend(gambar("16-produk-disdukcapil", "Produk Disdukcapil — akordeon berisi penjelasan &amp; persyaratan lengkap tiap layanan.", 14.5 * cm))
    el.extend(gambar("17-formulir-persyaratan", "Formulir &amp; Persyaratan — 46 berkas siap unduh, judul mengikuti kode formulir baku.", 14.5 * cm))

    el.append(P("4.6 Media Informasi — Berita, Galeri, GIS, Demografi", "h2"))
    el.extend(gambar("13-gis", "GIS Dukcapil — peta sebaran penduduk per kecamatan Kabupaten Pesisir Barat.", 14.5 * cm))
    el.extend(gambar("15-demografi", "Laporan Data Demografi — 8 kategori, dapat dirinci sampai tingkat pekon.", 14.5 * cm))

    el.append(P("4.7 Pengaduan, Kritik &amp; Saran, dan SKM", "h2"))
    el.append(P(
        "Menu <b>Pengaduan</b> memuat dua submenu: <i>Pengaduan Masyarakat</i> (sekaligus WBS) dan "
        "<i>Kritik &amp; Saran</i>. Menu WBS yang dahulu berdiri sendiri kini dilebur ke Pengaduan "
        "agar warga tidak bingung memilih kanal; halaman /wbs/tentang-wbs dan /wbs/form-pengaduan "
        "tetap dapat diakses dan tercantum di peta situs."))
    el.extend(gambar("10-skm-form", "Form Survei Kepuasan Masyarakat — 9 unsur, skala 1–4 sesuai Permenpan RB 14/2017.", 14.5 * cm))

    el.append(P("4.8 PPID &amp; Halaman Legal", "h2"))
    el.extend(gambar("21-ppid-berkala", "PPID — Informasi Wajib Diumumkan Secara Berkala (UU No. 14 Tahun 2008).", 14.5 * cm))

    return el
