'use client';

import { motion } from 'framer-motion';
import { Footer } from '@/components/shared/footer';
import { Download, FileText } from 'lucide-react';
import Link from 'next/link';

export interface InfoPageContent {
  title: string;
  description: string;
  body?: string[];
  list?: string[];
  /** Tautan lanjutan (mis. situs resmi eksternal). Dibuka di tab baru bila external. */
  links?: { label: string; href: string; external?: boolean }[];
  downloadLabel?: string;
}

export interface InfoBerkas {
  id: number;
  judul: string;
  file: string;
  createdAt: string;
}

export function InfoPage({
  content,
  berkas,
}: {
  content: InfoPageContent;
  /** Dokumen unggahan dashboard (Dokumen Publikasi) yang tampil di halaman ini. */
  berkas?: InfoBerkas[];
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/30">
      <div className="container mx-auto flex-1 px-4 md:px-8 lg:px-16 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              {content.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{content.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-4"
        >
          {content.body?.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-700">
              {p}
            </p>
          ))}

          {content.list && (
            <ul className="space-y-2 pt-2">
              {content.list.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {content.links && content.links.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {content.links.map((l) =>
                l.external ? (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          )}

          {berkas && berkas.length > 0 && (
            <div className="pt-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Berkas</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Nama Berkas</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">Tanggal Unggah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {berkas.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <a
                            href={b.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                          >
                            <Download className="h-4 w-4 flex-shrink-0" aria-hidden />
                            {b.judul}
                          </a>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                          {new Date(b.createdAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(!berkas || berkas.length === 0) && (
            <div className="pt-4 border-t border-slate-100 text-sm text-slate-500">
              Dokumen resmi belum tersedia secara digital di portal ini. Untuk informasi
              lengkap, silakan{' '}
              <Link href="/hubungi-kami/alamat" className="text-primary hover:underline">
                hubungi Disdukcapil Pesisir Barat
              </Link>{' '}
              secara langsung.
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
