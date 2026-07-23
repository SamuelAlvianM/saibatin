import { prisma } from '@/lib/prisma';
import { dokumenJenisForPath } from '@/lib/dokumen-registry';
import type { PpidInformasiGrup, PpidInformasiItem } from '@/lib/ppid-informasi';
import { ppidKartuKunci } from '@/lib/static-content-registry';
import { getIcon } from '@/lib/icon-map';
import { getSession } from '@/lib/auth';
import { PpidTambahKartu, PpidAksiKartu } from '@/components/ppid/kelola-kartu';
import {
  HalamanIndeksKartu,
  type KartuIndeksItem,
} from '@/components/shared/halaman-indeks';

/**
 * Halaman indeks klasifikasi Informasi Publik PPID — kartu per kategori
 * (bentukan sama dengan Laporan Data Demografi) dengan jumlah dokumen resmi
 * yang sudah diunggah.
 *
 * Daftar kartunya bisa ditambah admin: bila kunci `ppid.kartu.<slug>` sudah
 * pernah disimpan di StaticContent, isinya menggantikan daftar bawaan.
 */
export async function PpidInformasiIndex({ grup }: { grup: PpidInformasiGrup }) {
  // Kartu efektif = simpanan admin (bila ada), selain itu bawaan.
  const row = await prisma.staticContent.findUnique({
    where: { kunci: ppidKartuKunci(grup.slug) },
  });
  const tersimpan = (row?.konten as { kartu?: PpidInformasiItem[] } | null)?.kartu;
  const kartu: PpidInformasiItem[] =
    Array.isArray(tersimpan) && tersimpan.length > 0 ? tersimpan : grup.items;

  const jenisByHref = new Map(kartu.map((i) => [i.href, dokumenJenisForPath(i.href)]));
  const semuaJenis = [...new Set([...jenisByHref.values()].flat())];

  const counts = semuaJenis.length
    ? await prisma.produk.groupBy({
        by: ['jenis'],
        where: { jenis: { in: semuaJenis }, file: { not: null } },
        _count: { _all: true },
      })
    : [];
  const countByJenis = new Map(counts.map((c) => [c.jenis, c._count._all]));

  // Hanya superadmin — API simpan konten statis memang membatasi ke level 1.
  const session = await getSession();
  const bolehKelola = session?.level === 1;

  const items: KartuIndeksItem[] = kartu.map((i) => {
    const jumlah = (jenisByHref.get(i.href) ?? []).reduce(
      (a, j) => a + (countByJenis.get(j) ?? 0),
      0,
    );
    return {
      href: i.href,
      title: i.title,
      description: i.description,
      // Ikon disimpan sebagai nama (string) agar kartu bisa dibuat dari dashboard.
      icon: getIcon(i.icon),
      gradasi: i.gradasi,
      stat: jumlah > 0 ? `${jumlah} dokumen` : undefined,
      aksi: bolehKelola ? (
        <PpidAksiKartu kartu={i} semua={kartu} grupSlug={grup.slug} />
      ) : undefined,
    };
  });

  const bolehTambah = bolehKelola;

  return (
    <HalamanIndeksKartu
      eyebrow="PPID · Keterbukaan Informasi Publik"
      judul={grup.judul}
      deskripsi={grup.deskripsi}
      items={items}
      aksiTambah={
        bolehTambah ? (
          <PpidTambahKartu grupSlug={grup.slug} kartuSaatIni={kartu} />
        ) : undefined
      }
    />
  );
}
