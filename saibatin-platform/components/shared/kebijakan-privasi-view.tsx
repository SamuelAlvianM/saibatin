"use client";

import { motion } from "framer-motion";
import { Footer } from "@/components/shared/footer";
import { EditableBlock } from "@/components/konten/inline-edit";
import { useStaticContent } from "@/lib/use-static-content";
import { ShieldCheck, AlertCircle } from "lucide-react";

function NumberedSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
        <AlertCircle className="h-4 w-4" aria-hidden />
        {title}
      </h2>
      <ol className="space-y-2.5">
        {items.map((p, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-700">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span className="pt-0.5">{p}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Kebijakan & Privasi — blok `info.kebijakan-privasi` (editable). */
export function KebijakanPrivasiView() {
  const data = useStaticContent(["info.kebijakan-privasi"])[
    "info.kebijakan-privasi"
  ] as { intro?: string; umum?: string[]; penggunaan?: string[] };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/30">
      <EditableBlock kunci="info.kebijakan-privasi" label="Kebijakan & Privasi">
        <div className="container mx-auto flex-1 px-4 md:px-8 lg:px-16 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                Kebijakan &amp; Privasi
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">{data.intro}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-8"
          >
            <NumberedSection
              title="Ketentuan Umum"
              items={Array.isArray(data.umum) ? data.umum : []}
            />
            <NumberedSection
              title="Ketentuan Penggunaan Aplikasi"
              items={Array.isArray(data.penggunaan) ? data.penggunaan : []}
            />
          </motion.div>
        </div>
      </EditableBlock>
      <Footer />
    </div>
  );
}
