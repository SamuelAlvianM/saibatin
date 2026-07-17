"""Rakit PANDUAN-UI-SAIBATIN.pdf dari buat_pdf.py + buat_pdf2.py."""
import os

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate

import buat_pdf as B
from buat_pdf2 import isi_dokumen2
from buat_pdf3 import isi_penutup, isi_tambahan_dashboard, isi_tambahan_publik
from buat_pdf4 import daftar_isi, isi_penutup2, isi_tambahan2
from buat_pdf5 import lampiran

OUT = B.OUT

doc = BaseDocTemplate(
    OUT, pagesize=A4,
    leftMargin=2 * cm, rightMargin=2 * cm,
    topMargin=1.75 * cm, bottomMargin=1.5 * cm,
    title="Panduan UI & Tahapan Fitur — Portal SAIBATIN",
    author="Disdukcapil Kabupaten Pesisir Barat",
    subject="Panduan UI & tahapan fitur Portal SAIBATIN",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="n")
doc.addPageTemplates([PageTemplate(id="utama", frames=[frame], onPage=B.hal_header)])

# urutan bab: sampul → 1-4 publik → 4.9-4.14 publik lanjutan → 5-6 dashboard
# → 6.8-6.12 dashboard lanjutan → 7-13 → 14-15 penutup
cerita = (
    B.sampul()
    + daftar_isi()
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

kb = os.path.getsize(OUT) // 1024
import pypdf
r = pypdf.PdfReader(OUT)
img = sum(len(p.images) for p in r.pages)
print(f"PDF dibuat: {OUT}")
print(f"  halaman : {len(r.pages)}")
print(f"  gambar  : {img}")
print(f"  ukuran  : {kb/1024:.1f} MB")
