"""Ambil screenshot seluruh halaman portal SAIBATIN untuk PDF panduan.

Jalankan dengan dev server hidup di http://localhost:3000.
Hasil: folder shots/*.png
"""
import os
import sys

from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)

# (nama file, url, tunggu-selektor|None, full_page, klik-selektor|None)
PUBLIK = [
    ("01-beranda-hero", "/", "h1", False, None),
    ("02-beranda-penuh", "/", "h1", True, None),
    ("03-login", "/login", "form", False, None),
    ("04-register", "/register", "form", False, None),
    ("05-lupa-password", "/forgot-password", "form", False, None),
    ("06-permohonan-online", "/permohonan-online", None, False, None),
    ("07-pengaduan-wbs", "/pengaduan", "h1", False, None),
    ("08-kritik-saran", "/hubungi-kami/kritik-saran", None, False, None),
    ("09-hubungi-kami", "/hubungi-kami", None, False, None),
    ("10-skm-form", "/hubungi-kami#survei", "#survei", False, None),
    ("11-berita", "/media/berita", None, False, None),
    ("12-galeri", "/galeri", None, False, None),
    ("13-gis", "/media/gis", None, False, None),
    ("14-peta-kantor", "/media/peta", None, False, None),
    ("15-demografi", "/media/demografi", None, False, None),
    ("16-produk-disdukcapil", "/produk/produk-disdukcapil", None, False, None),
    ("17-formulir-persyaratan", "/produk/formulir-persyaratan", None, False, None),
    ("18-produk-hukum", "/produk/hukum", None, False, None),
    ("19-produk-sop", "/produk/sop", None, False, None),
    ("20-ppid-profil", "/ppid/profil-ppid", None, False, None),
    ("21-ppid-berkala", "/ppid/informasi-berkala", None, False, None),
    ("22-ppid-setiap-saat", "/ppid/informasi-setiap-saat", None, False, None),
    ("23-ppid-lhkpn", "/ppid/lhkpn", None, False, None),
    ("24-wbs-tentang", "/wbs/tentang-wbs", None, False, None),
    ("25-wbs-form", "/wbs/form-pengaduan", None, False, None),
    ("26-sitemap", "/sitemap", None, False, None),
    ("27-privasi", "/privasi", None, False, None),
    ("28-syarat", "/syarat", None, False, None),
    ("29-not-found", "/halaman-tidak-ada-xyz", None, False, None),
]

TERLINDUNGI = [
    ("30-dashboard", "/dashboard", None, False, None),
    ("31-dashboard-penuh", "/dashboard", None, True, None),
    ("32-pengajuan-baru", "/dashboard/pengajuan-baru", None, False, None),
    ("33-permohonan", "/dashboard/permohonan", None, False, None),
    ("34-konten", "/dashboard/konten", None, False, None),
    ("35-berita-admin", "/dashboard/berita", None, False, None),
    ("36-galeri-admin", "/dashboard/galeri", None, False, None),
    ("37-media", "/dashboard/media", None, False, None),
    ("38-produk-admin", "/dashboard/produk", None, False, None),
    ("39-demografi-admin", "/dashboard/demografi", None, False, None),
    ("40-pengaduan-admin", "/dashboard/pengaduan", None, False, None),
    ("41-skm-admin", "/dashboard/skm", None, False, None),
    ("42-users-admin", "/dashboard/users", None, False, None),
    ("43-tiket-admin", "/dashboard/tiket", None, False, None),
    ("44-riwayat", "/riwayat", None, False, None),
    ("45-profil", "/profil", None, False, None),
    ("46-tiket", "/tiket", None, False, None),
]


def jepret(page, nama, url, tunggu, full, klik):
    try:
        page.goto(BASE + url, wait_until="networkidle", timeout=25000)
    except Exception:
        try:
            page.goto(BASE + url, wait_until="domcontentloaded", timeout=25000)
        except Exception as e:
            print(f"  !! {nama}: gagal buka ({e.__class__.__name__})")
            return False
    if tunggu:
        try:
            page.wait_for_selector(tunggu, timeout=6000)
        except Exception:
            pass
    if klik:
        try:
            page.click(klik, timeout=4000)
        except Exception:
            pass
    page.wait_for_timeout(1400)
    # tutup widget aksesibilitas / elemen mengambang yang menutupi
    page.evaluate("""() => {
      document.querySelectorAll('[data-nextjs-toast], nextjs-portal').forEach(e => e.remove());
    }""")
    path = os.path.join(OUT, nama + ".png")
    page.screenshot(path=path, full_page=full)
    kb = os.path.getsize(path) // 1024
    print(f"  ok {nama:26} {kb:>5} KB")
    return True


with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    page = ctx.new_page()

    print("== HALAMAN PUBLIK ==")
    for nama, url, tunggu, full, klik in PUBLIK:
        jepret(page, nama, url, tunggu, full, klik)

    print("\n== LOGIN ADMIN ==")
    page.goto(BASE + "/login", wait_until="networkidle")
    page.fill('input[type="text"]', "admin")
    page.fill('input[type="password"]', "admin123")
    page.click('button[type="submit"]')
    page.wait_for_timeout(3500)
    print("  login selesai, url =", page.url)

    print("\n== HALAMAN TERLINDUNGI ==")
    for nama, url, tunggu, full, klik in TERLINDUNGI:
        jepret(page, nama, url, tunggu, full, klik)

    b.close()

n = len([f for f in os.listdir(OUT) if f.endswith(".png")])
print(f"\nTOTAL screenshot: {n} -> {OUT}")
