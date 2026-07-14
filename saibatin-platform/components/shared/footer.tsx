import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Clock, MapPin } from "lucide-react";

const grup = {
  layanan: [
    { label: "Permohonan Online", href: "/permohonan-online" },
    { label: "Riwayat Permohonan", href: "/riwayat" },
    { label: "Pengaduan Masyarakat", href: "/pengaduan" },
    { label: "Survei Kepuasan", href: "/hubungi-kami#survei" },
  ],
  informasi: [
    { label: "Berita", href: "/media/berita" },
    { label: "Galeri", href: "/galeri" },
    { label: "Produk & Layanan", href: "/produk/produk-disdukcapil" },
    { label: "PPID", href: "/ppid/profil-ppid" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-[#0d1b2a] text-slate-400">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 flex-shrink-0">
                <Image
                  src="/logo-saibatin.png"
                  alt="Logo SAIBATIN"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-wide">
                  SAIBATIN
                </span>
                <p className="text-xs text-slate-400">
                  Disdukcapil Kabupaten Pesisir Barat
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Portal layanan administrasi kependudukan dan pencatatan sipil
              Kabupaten Pesisir Barat. Melayani masyarakat secara profesional,
              akuntabel, dan prima.
            </p>
          </div>

          {/* Link groups */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Layanan
              </h4>
              <ul className="space-y-2.5">
                {grup.layanan.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Informasi
              </h4>
              <ul className="space-y-2.5">
                {grup.informasi.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Kantor Kami */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Kantor Kami
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  <span>
                    Komplek Perkantoran Pemda Kabupaten Pesisir Barat,
                    <br />
                    Kec. Pesisir Tengah, Kabupaten Pesisir Barat, Lampung
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>disdukcapil@pesisirbaratkab.go.id</span>
                </li>
                {/* <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>(0728) 000000</span>
                </li> */}
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>Senin – Jumat: 08.00 – 16.00 WIB</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <p>
              © {year}{" "}
              <span className="text-slate-300 font-medium">SAIBATIN</span> —
              Disdukcapil Kabupaten Pesisir Barat
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/kebijakan-privasi"
                className="hover:text-white transition-colors"
              >
                Kebijakan Privasi
              </Link>
              <span className="text-slate-700">|</span>
              <Link
                href="/syarat"
                className="hover:text-white transition-colors"
              >
                Syarat &amp; Ketentuan
              </Link>
              <span className="text-slate-700">|</span>
              <Link
                href="/sitemap"
                className="hover:text-white transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
