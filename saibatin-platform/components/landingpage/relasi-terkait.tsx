'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SectionHeading } from './section-heading';
import { relasiTerkait } from '@/lib/relasi-content';

export default function RelasiTerkait() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <SectionHeading>Relasi Terkait</SectionHeading>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {relasiTerkait.map((r, i) => (
            <motion.a
              key={r.nama}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              title={r.nama}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="group flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
                className="relative h-14 w-24 grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
              >
                <Image src={r.logo} alt={r.nama} fill className="object-contain" sizes="96px" />
              </motion.div>
              <span className="max-w-[8rem] text-center text-xs text-slate-500 group-hover:text-slate-700">
                {r.nama}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
