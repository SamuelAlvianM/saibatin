'use client';

import { motion } from 'framer-motion';
import { Footer } from '@/components/shared/footer';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export interface InfoPageContent {
  title: string;
  description: string;
  body?: string[];
  list?: string[];
  downloadLabel?: string;
}

export function InfoPage({ content }: { content: InfoPageContent }) {
  return (
    <div className="relative bg-slate-50/30 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
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
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="pt-4 border-t border-slate-100 text-sm text-slate-500">
            Dokumen resmi belum tersedia secara digital di portal ini. Untuk informasi
            lengkap, silakan{' '}
            <Link href="/hubungi-kami/alamat" className="text-blue-600 hover:underline">
              hubungi Disdukcapil Pesisir Barat
            </Link>{' '}
            secara langsung.
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
