"""Rakit DOKUMENTASI-SISTEM-SAIBATIN.pdf gabungan:
Bagian I (sistem + cPanel, untuk admin) + Bagian II (panduan UI 41 hal)."""
import os

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate

import buat_pdf as B
import buat_pdf_sistem as SIS
import buat_pdf_sistem2 as SIS2
from buat_pdf2 import isi_dokumen2
from buat_pdf3 import isi_penutup, isi_tambahan_dashboard, isi_tambahan_publik
from buat_pdf4 import isi_penutup2, isi_tambahan2
from buat_pdf5 import lampiran

OUT = r"C:\sam\SAM-AMANDA-GALANG\saibatin\saibatin-platform\DOKUMENTASI-SISTEM-SAIBATIN.pdf"

# Running-header untuk seluruh dokumen gabungan.
B.JUDUL_DOK = SIS2.JUDUL

doc = BaseDocTemplate(
    OUT, pagesize=A4,
    leftMargin=2 * cm, rightMargin=2 * cm,
    topMargin=1.75 * cm, bottomMargin=1.5 * cm,
    title="Dokumentasi Sistem & Panduan UI — Portal SAIBATIN",
    author="Disdukcapil Kabupaten Pesisir Barat",
    subject="Dokumentasi sistem, kebutuhan cPanel & panduan UI Portal SAIBATIN",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="n")
doc.addPageTemplates([PageTemplate(id="utama", frames=[frame], onPage=B.hal_header)])

cerita = (
    SIS2.sampul_gabungan()
    + SIS2.daftar_isi_gabungan()
    # ---- BAGIAN I ----
    + SIS2._divider("BAGIAN I", "Dokumentasi Sistem",
                    "Teknologi, arsitektur, kebutuhan sumber daya &amp; cara menjalankan di cPanel — untuk administrator server")
    + SIS.bab_teknis()          # 1 Ringkasan, 2 Teknologi, 3 Arsitektur, 4 Sumber Daya
    + SIS2.bab_deploy_lengkap()  # 5 cPanel/Passenger, 6 .env, 7 Keamanan, 8 Checklist admin
    # ---- BAGIAN II ----
    + SIS2._divider("BAGIAN II", "Panduan UI &amp; Tahapan Fitur",
                    "Tampilan &amp; cara pemakaian aplikasi untuk warga dan petugas")
    + B.isi_dokumen()
    + isi_tambahan_publik()
    + isi_tambahan2()
    + isi_dokumen2()
    + isi_tambahan_dashboard()
    + isi_penutup()
    + isi_penutup2()
    + lampiran()
)
doc.build(cerita)

import pypdf
r = pypdf.PdfReader(OUT)
img = sum(len(p.images) for p in r.pages)
print(f"PDF: {OUT}")
print(f"  halaman: {len(r.pages)} | gambar: {img} | ukuran: {os.path.getsize(OUT)/1024/1024:.1f} MB")
