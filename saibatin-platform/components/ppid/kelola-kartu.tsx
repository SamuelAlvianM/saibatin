'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ICON_NAMES, getIcon } from '@/lib/icon-map';
import {
  PPID_GRADASI_PILIHAN,
  type PpidInformasiItem,
} from '@/lib/ppid-informasi';

/**
 * Pengelolaan kartu indeks PPID untuk admin: tambah, ubah, hapus.
 *
 * Sumber kebenaran = SELURUH daftar kartu grup, disimpan di StaticContent
 * kunci `ppid.kartu.<slug-grup>`. Karena alamat halaman diturunkan dari daftar
 * ini, menghapus kartu otomatis membebaskan alamatnya untuk dipakai lagi.
 *
 * Alamat halaman TIDAK ditampilkan sebagai field — selalu mengikuti judul.
 * Bila bentrok dengan kartu lain, penyimpanan ditolak dengan pesan yang
 * menyebut kartu mana yang memakainya.
 */

function keSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function simpanDaftar(grupSlug: string, kartu: PpidInformasiItem[]) {
  const res = await fetch('/api/admin/static-content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kunci: `ppid.kartu.${grupSlug}`, konten: { kartu } }),
  });
  const json = await res.json();
  if (json.error?.length) throw new Error(json.error[0]);
}

// ───────────────────────────── Form (dipakai tambah & ubah) ────────────────

function FormKartu({
  awal,
  semua,
  grupSlug,
  onSelesai,
}: {
  /** Kartu yang diubah; undefined = membuat baru. */
  awal?: PpidInformasiItem;
  semua: PpidInformasiItem[];
  grupSlug: string;
  onSelesai: () => void;
}) {
  const router = useRouter();
  const [menyimpan, setMenyimpan] = useState(false);
  const [judul, setJudul] = useState(awal?.title ?? '');
  const [deskripsi, setDeskripsi] = useState(awal?.description ?? '');
  const [ikon, setIkon] = useState(awal?.icon ?? 'FileText');
  const [gradasi, setGradasi] = useState(awal?.gradasi ?? PPID_GRADASI_PILIHAN[0].value);
  const [cariIkon, setCariIkon] = useState('');

  const Ikon = getIcon(ikon);
  const slug = keSlug(judul);
  const bisaSimpan = judul.trim().length > 0 && slug.length > 0 && !menyimpan;

  const ikonTersaring = useMemo(() => {
    const q = cariIkon.trim().toLowerCase();
    if (!q) return ICON_NAMES;
    return ICON_NAMES.filter((n) => n.toLowerCase().includes(q));
  }, [cariIkon]);

  async function simpan() {
    if (!bisaSimpan) return;
    const href = `/ppid/${slug}`;

    // Bentrok alamat — sebutkan kartu mana yang memakainya agar jelas.
    const bentrok = semua.find((k) => k.href === href && k.href !== awal?.href);
    if (bentrok) {
      toast.error(
        `Alamat halaman "${href}" sudah dipakai menu "${bentrok.title}". Ganti judulnya dengan yang berbeda.`,
        { duration: 6000 },
      );
      return;
    }

    setMenyimpan(true);
    try {
      const baru: PpidInformasiItem = {
        title: judul.trim(),
        href,
        description: deskripsi.trim(),
        icon: ikon,
        gradasi,
      };
      const daftar = awal
        ? semua.map((k) => (k.href === awal.href ? baru : k))
        : [...semua, baru];
      await simpanDaftar(grupSlug, daftar);
      toast.success(awal ? 'Menu diperbarui' : 'Menu baru ditambahkan');
      onSelesai();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <>
      {/* Pratinjau — markup identik dengan kartu asli */}
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">
          Pratinjau
        </p>
        <div className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${gradasi}`}
          >
            <Ikon className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold leading-snug text-slate-900">
            {judul.trim() || 'Judul menu baru'}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            {deskripsi.trim() || 'Deskripsi singkat menu ini akan tampil di sini.'}
          </p>
          <div className="mt-auto flex items-center justify-end pt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm">
              Lihat Detail <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="ppid-judul">Judul</Label>
          <Input
            id="ppid-judul"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="mis. Laporan Keuangan Tahunan"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="ppid-desk">Deskripsi singkat</Label>
          <Input
            id="ppid-desk"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Satu kalimat penjelasan isi menu."
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Warna kotak ikon</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PPID_GRADASI_PILIHAN.map((g) => (
              <button
                key={g.value}
                type="button"
                title={g.label}
                onClick={() => setGradasi(g.value)}
                className={`h-9 w-9 rounded-lg bg-gradient-to-br ring-offset-2 transition ${g.value} ${
                  gradasi === g.value ? 'ring-2 ring-slate-900' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="ppid-cari-ikon">Ikon</Label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="ppid-cari-ikon"
              value={cariIkon}
              onChange={(e) => setCariIkon(e.target.value)}
              placeholder="Cari ikon… (mis. file, user, shield)"
              className="pl-9"
            />
          </div>
          <div className="mt-2 grid max-h-44 grid-cols-8 gap-1.5 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {ikonTersaring.map((nama) => {
              const I = getIcon(nama);
              return (
                <button
                  key={nama}
                  type="button"
                  title={nama}
                  onClick={() => setIkon(nama)}
                  className={`flex h-9 items-center justify-center rounded-md transition ${
                    ikon === nama
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <I className="h-4 w-4" />
                </button>
              );
            })}
            {ikonTersaring.length === 0 && (
              <p className="col-span-8 py-4 text-center text-xs text-slate-400">
                Ikon tidak ditemukan.
              </p>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onSelesai}>
          Batal
        </Button>
        <Button onClick={simpan} disabled={!bisaSimpan}>
          {menyimpan ? 'Menyimpan…' : awal ? 'Simpan perubahan' : 'Simpan menu'}
        </Button>
      </DialogFooter>
    </>
  );
}

// ───────────────────────────── Area "Tambah menu baru" ─────────────────────

export function PpidTambahKartu({
  grupSlug,
  kartuSaatIni,
}: {
  grupSlug: string;
  kartuSaatIni: PpidInformasiItem[];
}) {
  const [buka, setBuka] = useState(false);

  return (
    <>
      <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white/40 p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Kerangka kartu — gambaran posisi kartu baru */}
          <div
            aria-hidden
            className="w-full max-w-xs rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
          >
            <div className="h-12 w-12 rounded-xl bg-slate-200" />
            <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
            <div className="mt-2.5 h-3 w-full rounded bg-slate-100" />
            <div className="mt-1.5 h-3 w-5/6 rounded bg-slate-100" />
            <div className="mt-5 flex justify-end">
              <div className="h-7 w-24 rounded-full bg-slate-200" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBuka(true)}
            className="group inline-flex items-center gap-3 self-end rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-primary/5 hover:text-primary sm:self-auto"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-slate-300 transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <Plus className="h-5 w-5" />
            </span>
            Tambah menu baru
          </button>
        </div>
      </div>

      <Dialog open={buka} onOpenChange={setBuka}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah menu baru</DialogTitle>
          </DialogHeader>
          <FormKartu
            semua={kartuSaatIni}
            grupSlug={grupSlug}
            onSelesai={() => setBuka(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ───────────────────────────── Tombol ubah / hapus per kartu ───────────────

export function PpidAksiKartu({
  kartu,
  semua,
  grupSlug,
}: {
  kartu: PpidInformasiItem;
  semua: PpidInformasiItem[];
  grupSlug: string;
}) {
  const router = useRouter();
  const [ubah, setUbah] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [menghapus, setMenghapus] = useState(false);

  async function hapus() {
    setMenghapus(true);
    try {
      // Menghapus dari daftar sekaligus MEMBEBASKAN alamat halamannya,
      // sehingga judul yang sama bisa dibuat lagi nanti.
      await simpanDaftar(
        grupSlug,
        semua.filter((k) => k.href !== kartu.href),
      );
      toast.success(`Menu "${kartu.title}" dihapus. Alamatnya bisa dipakai lagi.`);
      setKonfirmasi(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus');
    } finally {
      setMenghapus(false);
    }
  }

  return (
    <>
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        <button
          type="button"
          title="Ubah menu"
          onClick={() => setUbah(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Hapus menu"
          onClick={() => setKonfirmasi(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-rose-600 hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <Dialog open={ubah} onOpenChange={setUbah}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ubah menu</DialogTitle>
          </DialogHeader>
          <FormKartu
            awal={kartu}
            semua={semua}
            grupSlug={grupSlug}
            onSelesai={() => setUbah(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus menu ini?</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-slate-600">
            Menu <strong>{kartu.title}</strong> akan dihapus dari halaman ini.
            Alamat <code className="rounded bg-slate-100 px-1">{kartu.href}</code>{' '}
            akan bebas dan bisa dipakai lagi untuk menu baru.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKonfirmasi(false)}>
              Batal
            </Button>
            <Button
              onClick={hapus}
              disabled={menghapus}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {menghapus ? 'Menghapus…' : 'Ya, hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
