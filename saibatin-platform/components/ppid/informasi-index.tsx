import { prisma } from '@/lib/prisma';
import { dokumenJenisForPath } from '@/lib/dokumen-registry';
import type { PpidInformasiGrup } from '@/lib/ppid-informasi';
import {
  HalamanIndeksKartu,
  type KartuIndeksItem,
} from '@/components/shared/halaman-indeks';

/**
 * Halaman indeks klasifikasi Informasi Publik PPID — kartu per kategori
 * (bentukan sama dengan Laporan Data Demografi) dengan jumlah dokumen resmi
 * yang sudah diunggah.
 */
export async function PpidInformasiIndex({ grup }: { grup: PpidInformasiGrup }) {
  const jenisByHref = new Map(
    grup.items.map((i) => [i.href, dokumenJenisForPath(i.href)]),
  );
  const semuaJenis = [...new Set([...jenisByHref.values()].flat())];

  const counts = semuaJenis.length
    ? await prisma.produk.groupBy({
        by: ['jenis'],
        where: { jenis: { in: semuaJenis }, file: { not: null } },
        _count: { _all: true },
      })
    : [];
  const countByJenis = new Map(counts.map((c) => [c.jenis, c._count._all]));

  const items: KartuIndeksItem[] = grup.items.map((i) => {
    const jumlah = (jenisByHref.get(i.href) ?? []).reduce(
      (a, j) => a + (countByJenis.get(j) ?? 0),
      0,
    );
    return {
      href: i.href,
      title: i.title,
      description: i.description,
      icon: i.icon,
      gradasi: i.gradasi,
      stat: jumlah > 0 ? `${jumlah} dokumen` : undefined,
    };
  });

  return (
    <HalamanIndeksKartu
      eyebrow="PPID · Keterbukaan Informasi Publik"
      judul={grup.judul}
      deskripsi={grup.deskripsi}
      items={items}
    />
  );
}
