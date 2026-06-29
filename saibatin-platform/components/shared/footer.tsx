'use client';

import { motion, cubicBezier } from "framer-motion";
import { Phone, Mail, Clock, MapPin, ExternalLink } from "lucide-react";

const smoothEase = cubicBezier(0.25, 0.1, 0.25, 1);

const footerLinks = {
  layanan: [
    { label: "Pendaftaran KK", href: "/layanan/kk" },
    { label: "Pembuatan KTP", href: "/layanan/ktp" },
    { label: "Akta Kelahiran", href: "/layanan/kelahiran" },
    { label: "Akta Kematian", href: "/layanan/kematian" },
    { label: "Pindah Datang", href: "/layanan/pindah" },
  ],
  informasi: [
    { label: "Profil Instansi", href: "/profil" },
    { label: "Struktur Organisasi", href: "/struktur" },
    { label: "Visi & Misi", href: "/visi-misi" },
    { label: "Berita & Pengumuman", href: "/berita" },
  ],
  bantuan: [
    { label: "FAQ", href: "/faq" },
    { label: "Panduan Layanan", href: "/panduan" },
    { label: "Syarat & Ketentuan", href: "/syarat" },
    { label: "Kebijakan Privasi", href: "/privasi" },
  ],
};

export function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: smoothEase }}
      className="bg-slate-900 text-slate-400"
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                D
              </div>
              <div>
                <span className="text-white font-semibold text-lg">Disdukcapil KTT</span>
                <p className="text-xs text-slate-500">Dinas Kependudukan & Pencatatan Sipil</p>
              </div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-sm leading-relaxed max-w-sm"
            >
              Melayani masyarakat dengan profesional, integritas, dan prima dalam bidang kependudukan dan pencatatan sipil.
            </motion.p>

            {/* Contact Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-3 pt-2"
            >
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span>Jl. Pelayanan Publik No. 123<br />Kecamatan Kota, Kabupaten KTT</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>1500-567 (Call Center)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>info@disdukcapil.ktt.go.id</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Senin - Jumat: 08.00 - 16.00 WIB</span>
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Layanan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Layanan</h4>
                <ul className="space-y-3">
                  {footerLinks.layanan.map((link) => (
                    <li key={link.href}>
                      <a 
                        href={link.href} 
                        className="text-sm hover:text-white transition-colors duration-300 inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Informasi */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Informasi</h4>
                <ul className="space-y-3">
                  {footerLinks.informasi.map((link) => (
                    <li key={link.href}>
                      <a 
                        href={link.href} 
                        className="text-sm hover:text-white transition-colors duration-300 inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Bantuan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Bantuan</h4>
                <ul className="space-y-3">
                  {footerLinks.bantuan.map((link) => (
                    <li key={link.href}>
                      <a 
                        href={link.href} 
                        className="text-sm hover:text-white transition-colors duration-300 inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 py-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500"
          >
            <p>© 2024 Dinas Kependudukan dan Pencatatan Sipil Kabupaten KTT. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="/privasi" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="/syarat" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
              <a href="/sitemap" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
}