"use client";

import { InfoPage, type InfoBerkas, type InfoPageContent } from "@/components/shared/info-page";
import { EditableBlock } from "@/components/konten/inline-edit";
import { useStaticContent } from "@/lib/use-static-content";

/**
 * Halaman info yang bisa diedit admin (Mode Edit / dashboard Konten Halaman).
 * Konten = default lib/info-content.ts di-merge override DB (blok `kunci`).
 * `links` tidak ikut diedit — tetap dari konfigurasi statis.
 */
export function EditableInfoPage({
  kunci,
  fallback,
  berkas,
  dokumenJenis,
}: {
  kunci: string;
  fallback: InfoPageContent;
  berkas?: InfoBerkas[];
  /** Kategori dokumen (t_produk.jenis) — aktifkan unggah PDF di mode edit. */
  dokumenJenis?: string;
}) {
  const data = useStaticContent([kunci])[kunci] as {
    title?: string;
    description?: string;
    body?: string[];
    list?: string[];
  };

  const content: InfoPageContent = {
    ...fallback,
    title: data.title || fallback.title,
    description: data.description || fallback.description,
    body: Array.isArray(data.body) ? data.body : fallback.body,
    list: Array.isArray(data.list) ? data.list : fallback.list,
  };

  return (
    <EditableBlock kunci={kunci} label="Konten Halaman">
      <InfoPage content={content} berkas={berkas} dokumenJenis={dokumenJenis} />
    </EditableBlock>
  );
}
