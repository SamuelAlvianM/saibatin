"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Footer } from "@/components/shared/footer";
import { EditableBlock } from "@/components/konten/inline-edit";
import { useStaticContent } from "@/lib/use-static-content";
import { cn } from "@/lib/utils";
import { ChevronDown, Package } from "lucide-react";

interface ProdukItem {
  image?: string;
  nama?: string;
  desc?: string;
}

/**
 * Halaman Produk Disdukcapil — pengantar layanan Capil/Dafduk + akordeon
 * daftar produk (gambar, nama, penjelasan). Konten dari blok
 * `produk.disdukcapil` (editable via Mode Edit / dashboard Konten Halaman).
 */
export function ProdukDisdukcapilView() {
  const data = useStaticContent(["produk.disdukcapil"])["produk.disdukcapil"] as {
    intro?: string;
    produk?: ProdukItem[];
  };
  const produk = Array.isArray(data.produk) ? data.produk : [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/30">
      <EditableBlock kunci="produk.disdukcapil" label="Produk Disdukcapil">
        <div className="container mx-auto flex-1 px-4 md:px-8 lg:px-16 py-12 lg:py-16">
          {/* Kepala halaman — gaya sama dengan InfoPage */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 flex-shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                Produk Disdukcapil
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Produk layanan Pencatatan Sipil (Capil) dan Pendaftaran Penduduk
                (Dafduk) Disdukcapil Kabupaten Pesisir Barat.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-6"
          >
            {data.intro && (
              <p className="text-sm leading-relaxed text-slate-700">{data.intro}</p>
            )}

            {/* Akordeon produk */}
            <div className="space-y-2">
              {produk.map((p, i) => {
                const open = openIdx === i;
                return (
                  <div
                    key={`${p.nama}-${i}`}
                    className={cn(
                      "overflow-hidden rounded-xl border transition-colors",
                      open ? "border-primary/40 bg-primary/[0.03]" : "border-slate-200",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          open
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-slate-800">
                        {p.nama}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300",
                          open && "rotate-180 text-primary",
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "grid transition-all duration-300 ease-out",
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-col items-center gap-4 px-4 pb-5 pt-1 sm:flex-row sm:items-start">
                          {p.image && (
                            <div className="relative h-36 w-48 flex-shrink-0">
                              <Image
                                src={p.image}
                                alt={p.nama ?? "Produk layanan"}
                                fill
                                className="object-contain"
                                sizes="192px"
                              />
                            </div>
                          )}
                          {/* `desc` = HTML dari editor richtext (hasil migrasi
                              portal lama: penjelasan + daftar persyaratan).
                              Sumbernya hanya admin level 1 / skrip migrasi —
                              pola render sama dengan halaman berita. */}
                          <div
                            className="prose prose-sm max-w-none text-slate-600
                                       prose-headings:text-slate-900 prose-strong:text-slate-900
                                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                       prose-li:my-0.5 prose-ol:my-2 prose-ul:my-2"
                            dangerouslySetInnerHTML={{ __html: p.desc ?? "" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {produk.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  Belum ada produk yang ditampilkan.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </EditableBlock>
      <Footer />
    </div>
  );
}
