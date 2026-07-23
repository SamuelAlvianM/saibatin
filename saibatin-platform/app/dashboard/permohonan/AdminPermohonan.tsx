'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Pagination } from '@/components/shared/pagination';
import { FilterPeriode } from '@/components/shared/filter-periode';
import { tulisAcuan, type KodePeriode } from '@/lib/periode';

// Radix Select tidak menerima value kosong, jadi "semua" perlu nilai sendiri.
const SEMUA_PETUGAS = '__semua__';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Loader2, Search, ClipboardList, X, Clock, CheckCircle2, XCircle, FileText,
  Eye, Lock, AlertTriangle, ArrowLeft, Download, User, Phone, Mail,
} from 'lucide-react';
import { BerkasGallery, PermohonanJourney } from '@/components/shared/permohonan-detail';
import { labelField, payloadDataEntries, payloadBerkasEntries } from '@/lib/permohonan-display';

/** Status final — data terkunci, hanya bisa dibuka lewat halaman Master. */
const FINAL_STATUS = ['SELESAI', 'DITOLAK'];

interface Item {
  id: number;
  noregister: string;
  status: string;
  catatan: string | null;
  createdAt: string;
  /** Kapan status terakhir diubah & oleh siapa (null = belum pernah diproses). */
  prosesAt: string | null;
  prosesByName: string | null;
  jenisNama: string;
  kategori: string;
  pemohon: string;
  pemohonId: string;
  hp: string;
  jumlahBerkas: number;
}

interface BerkasItem {
  id: number;
  namaFile: string;
  path: string;
  mimeType: string | null;
}

interface Detail {
  id: number;
  noregister: string;
  status: string;
  catatan: string | null;
  createdAt: string;
  updatedAt: string;
  prosesByName?: string | null;
  prosesAt?: string | null;
  payload: Record<string, unknown> | null;
  jenis: { nama: string; kategori: string } | null;
  user: { userId: string; userFullname: string | null; userHp: string | null; userEmail: string | null } | null;
  berkas: BerkasItem[];
}

/** Pilihan alasan penolakan yang lazim; "Lainnya" -> alasan diketik bebas. */
const ALASAN_TOLAK = [
  'Berkas tidak lengkap',
  'Berkas tidak jelas / buram',
  'Data tidak sesuai dengan dokumen',
  'NIK / dokumen tidak valid',
  'Persyaratan belum terpenuhi',
  'Lainnya',
];

const STATUS: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  MENUNGGU: { label: 'Menunggu', cls: 'text-warning bg-warning/10 border-warning/20', icon: Clock },
  DIPROSES: { label: 'Diproses', cls: 'text-primary bg-primary/10 border-primary/20', icon: Clock },
  SELESAI: { label: 'Selesai', cls: 'text-success bg-success/10 border-success/20', icon: CheckCircle2 },
  DITOLAK: { label: 'Ditolak', cls: 'text-destructive bg-destructive/10 border-destructive/20', icon: XCircle },
};
const STATUS_KEYS = ['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK'];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS[status] ?? { label: status, cls: 'text-slate-600 bg-slate-50 border-slate-200', icon: FileText };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

export function AdminPermohonan() {
  const [items, setItems] = useState<Item[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  // Paginasi bernomor. Pencarian & filter dijalankan di server, jadi hasilnya
  // menjangkau SELURUH data — data di halaman 3 tetap ketemu walau kita sedang
  // berada di halaman 1.
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalHalaman, setTotalHalaman] = useState(1);
  // Filter tambahan: petugas pemroses & rentang waktu.
  const [petugas, setPetugas] = useState('');
  const [periode, setPeriode] = useState<KodePeriode>('');
  // Titik acuan periode — digeser tombol ‹ › untuk melihat minggu/bulan lalu.
  const [acuan, setAcuan] = useState(() => new Date());
  const [daftarPetugas, setDaftarPetugas] = useState<{ id: number; nama: string }[]>([]);
  // Token anti-race saat filter/pencarian berubah.
  const reqId = useRef(0);
  // Panel detail inline (menggantikan tabel — bukan pindah halaman).
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  // Alasan penolakan terpilih (dropdown). '' = belum pilih; 'Lainnya' = ketik bebas.
  const [rejectPreset, setRejectPreset] = useState('');
  const [saving, setSaving] = useState(false);
  // Konfirmasi ekstra sebelum status dijadikan final (Selesai/Ditolak).
  const [confirmFinal, setConfirmFinal] = useState(false);
  const [unduhPdf, setUnduhPdf] = useState(false);
  // Baris yang disorot setelah datang dari notifikasi (?sorot=<id>).
  const [sorotId, setSorotId] = useState<number | null>(null);
  const sorotAwal = useRef<number | null>(null);

  const load = useCallback(
    async (halaman: number) => {
      const my = ++reqId.current;
      setLoading(true);
      const params = new URLSearchParams({ limit: '20', page: String(halaman) });
      if (statusFilter) params.set('status', statusFilter);
      if (q.trim()) params.set('q', q.trim());
      if (petugas) params.set('petugas', petugas);
      if (periode) {
        params.set('periode', periode);
        params.set('acuan', tulisAcuan(acuan));
      }
      // Sekali pakai: server yang menentukan halaman mana yang memuat data ini.
      if (sorotAwal.current) {
        params.set('sorot', String(sorotAwal.current));
        params.delete('page');
      }
      const res = await fetch(`/api/admin/permohonan?${params.toString()}`);
      const json = await res.json();
      if (my !== reqId.current) return; // filter/pencarian sudah berganti
      if (sorotAwal.current) {
        setPage(json.data?.page ?? 1);
        sorotAwal.current = null;
      }
      setItems(json.data?.items ?? []);
      setTotal(json.data?.total ?? 0);
      setTotalHalaman(json.data?.totalHalaman ?? 1);
      if (json.data?.counts) setCounts(json.data.counts);
      if (json.data?.daftarPetugas) setDaftarPetugas(json.data.daftarPetugas);
      setLoading(false);
    },
    [statusFilter, q, petugas, periode, acuan],
  );

  // Datang dari notifikasi: ?sorot=<id>. Dibaca sekali sebelum pemuatan
  // pertama, lalu dibuang dari URL supaya refresh tidak menyorot ulang.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('sorot');
    const id = p ? Number(p) : NaN;
    if (Number.isFinite(id)) {
      sorotAwal.current = id;
      setSorotId(id);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Ganti filter → selalu balik ke halaman 1, kalau tidak bisa terdampar di
  // halaman yang sudah tidak ada isinya.
  useEffect(() => {
    setPage(1);
    load(1);
  }, [statusFilter, petugas, periode, acuan]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sorotan cukup sebagai penunjuk arah — hilang sendiri setelah terlihat.
  useEffect(() => {
    if (sorotId == null || loading) return;
    document
      .getElementById(`permohonan-${sorotId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t = setTimeout(() => setSorotId(null), 2600);
    return () => clearTimeout(t);
  }, [sorotId, loading, items]);

  // Pencarian diketik: tunggu jeda mengetik supaya tidak membanjiri server.
  // Sengaja DILEWATI pada render pertama — kalau ikut jalan, ia memuat ulang
  // dengan page=1 dan membatalkan lompatan ke halaman hasil ?sorot=, sekaligus
  // membuat dua permintaan yang sama saat halaman baru dibuka.
  const lewatiDebounce = useRef(true);
  useEffect(() => {
    if (lewatiDebounce.current) {
      lewatiDebounce.current = false;
      return;
    }
    const t = setTimeout(() => {
      setPage(1);
      load(1);
    }, 400);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Unduh PDF lewat fetch, bukan <a href>, supaya bisa menampilkan status
   * "menyiapkan". Server menyematkan seluruh gambar ke dalam dokumen, jadi
   * pembuatannya bisa beberapa detik — tanpa indikator, tombol terasa mati.
   */
  const unduhDokumen = async (id: number, noregister: string) => {
    setUnduhPdf(true);
    try {
      const res = await fetch(`/api/permohonan/${id}/pdf`);
      if (!res.ok) {
        toast.error(`Gagal menyiapkan dokumen (HTTP ${res.status})`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `permohonan-${noregister}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Dokumen siap diunduh');
    } catch {
      toast.error('Gagal menghubungi server');
    } finally {
      setUnduhPdf(false);
    }
  };

  const gantiHalaman = (p: number) => {
    setPage(p);
    load(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDetail = async (it: Item) => {
    setDetailLoading(true);
    setDetail(null);
    const res = await fetch(`/api/admin/permohonan/${it.id}`);
    const json = await res.json();
    setDetailLoading(false);
    if (json.data?.permohonan) {
      setDetail(json.data.permohonan);
    } else {
      toast.error(json.error?.[0] ?? 'Gagal memuat detail');
    }
  };

  const closeDetail = () => {
    setDetail(null);
  };

  const openEdit = (it: { id: number; noregister: string; status: string; catatan: string | null; pemohon: string; jenisNama: string }) => {
    setEditing(it as Item);
    setEditStatus(it.status);
    setEditCatatan(it.catatan ?? '');
    setRejectPreset('');
    setConfirmFinal(false);
  };

  const closeEdit = () => {
    setEditing(null);
    setConfirmFinal(false);
  };

  /** Klik Simpan: status final butuh konfirmasi ekstra dulu. */
  const save = async () => {
    if (!editing) return;
    // Penolakan wajib disertai alasan (pilih dari dropdown atau ketik bila "Lainnya").
    if (editStatus === 'DITOLAK' && !editCatatan.trim()) {
      toast.error(
        rejectPreset === 'Lainnya'
          ? 'Tulis alasan penolakan'
          : 'Pilih alasan penolakan'
      );
      return;
    }
    if (FINAL_STATUS.includes(editStatus) && !confirmFinal) {
      setConfirmFinal(true);
      return;
    }
    setConfirmFinal(false);
    setSaving(true);
    const res = await fetch(`/api/admin/permohonan/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: editStatus, catatan: editCatatan }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error?.length) {
      toast.error(json.error[0]);
    } else {
      toast.success(json.success?.[0] ?? 'Tersimpan');
      setItems((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, status: editStatus, catatan: editCatatan } : p))
      );
      // Detail tetap terbuka — status & catatan ikut diperbarui (mis. agar
      // tombol Unduh Dokumen langsung muncul saat Selesai).
      setDetail((prev) =>
        prev && prev.id === editing.id ? { ...prev, status: editStatus, catatan: editCatatan } : prev
      );
      setEditing(null);
    }
  };

  const payload: Record<string, unknown> =
    detail?.payload && typeof detail.payload === 'object' ? (detail.payload as Record<string, unknown>) : {};
  // Semua isian form (tanpa field berkas/internal), berlabel bahasa manusia.
  const payloadEntries = payloadDataEntries(payload);
  // Berkas: gabungan t_berkas + berkas yang hanya tercatat di payload.
  const berkasPaths = new Set((detail?.berkas ?? []).map((b) => b.path));
  const berkasView = [
    ...(detail?.berkas ?? []).map((b) => ({ label: b.namaFile, path: b.path })),
    ...payloadBerkasEntries(payload).filter((b) => !berkasPaths.has(b.path)),
  ];
  const detailFinal = detail ? FINAL_STATUS.includes(detail.status) : false;

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6">
      {/* ─────────── PANEL DETAIL INLINE ─────────── */}
      {(detail || detailLoading) ? (
        <div>
          <div className="mb-4 flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={closeDetail}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali ke tabel
            </Button>
            {detail && <StatusBadge status={detail.status} />}
          </div>

          {detailLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : detail && (
            <div className="space-y-4">
              {/* Header permohonan */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <h3 className="font-semibold text-slate-900">{detail.jenis?.nama ?? 'Permohonan'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-mono font-semibold">{detail.noregister}</span>
                  {' '}&middot; {detail.jenis?.kategori ?? '-'}
                  {' '}&middot; diajukan {new Date(detail.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>

              {/* Journey status */}
              <div className="rounded-xl border border-slate-200 p-4">
                <PermohonanJourney
                  status={detail.status}
                  createdAt={detail.createdAt}
                  prosesAt={detail.prosesAt}
                  updatedAt={detail.updatedAt}
                />
              </div>

              {/* Pemohon */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Pemohon</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <p className="flex items-center gap-2 text-slate-700">
                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      {detail.user?.userFullname ?? '-'}
                      <span className="block text-xs font-mono text-slate-400">{detail.user?.userId ?? '-'}</span>
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" /> {detail.user?.userHp ?? '-'}
                  </p>
                  <p className="flex items-center gap-2 text-slate-700 break-all">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" /> {detail.user?.userEmail ?? '-'}
                  </p>
                </div>
              </div>

              {/* Data permohonan (payload) */}
              {payloadEntries.length > 0 && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Data Permohonan</h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {payloadEntries.map(([k, v]) => (
                      <div key={k} className="bg-slate-50/80 rounded-lg px-3 py-2">
                        <dt className="text-xs text-slate-400">{labelField(k)}</dt>
                        <dd className="text-sm font-medium text-slate-800 mt-0.5 break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Berkas lampiran — preview gambar (t_berkas ∪ payload) */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                  Berkas Lampiran ({berkasView.length})
                </h4>
                <BerkasGallery items={berkasView} />
              </div>

              {/* Catatan petugas + jejak pemroses */}
              {(detail.catatan || detail.prosesByName) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  {detail.catatan && (
                    <>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Catatan Petugas</h4>
                      <p className="text-sm text-slate-700">{detail.catatan}</p>
                    </>
                  )}
                  {detail.prosesByName && (
                    <p className={`flex items-center gap-1.5 text-xs text-slate-500 ${detail.catatan ? 'mt-2 pt-2 border-t border-slate-200' : ''}`}>
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      Diproses oleh <b className="text-slate-700">{detail.prosesByName}</b>
                      {detail.prosesAt && (
                        <> &middot; {new Date(detail.prosesAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Aksi: proses (baca dulu detail di atas, baru proses di sini) */}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                {detail.status === 'SELESAI' && (
                  <Button
                    variant="outline"
                    disabled={unduhPdf}
                    onClick={() => unduhDokumen(detail.id, detail.noregister)}
                    className="border-success/40 text-success hover:bg-success/10 hover:text-success"
                  >
                    {unduhPdf ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Menyiapkan dokumen…
                      </>
                    ) : (
                      <>
                        <Download className="mr-1.5 h-4 w-4" /> Unduh Dokumen (PDF)
                      </>
                    )}
                  </Button>
                )}
                {detailFinal ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500"
                    title="Permohonan final — buka kunci lewat halaman Master"
                  >
                    <Lock className="h-3.5 w-3.5" /> Permohonan final &amp; terkunci
                  </span>
                ) : (
                  <Button
                    onClick={() =>
                      openEdit({
                        id: detail.id,
                        noregister: detail.noregister,
                        status: detail.status,
                        catatan: detail.catatan,
                        pemohon: detail.user?.userFullname ?? detail.user?.userId ?? '-',
                        jenisNama: detail.jenis?.nama ?? '-',
                      })
                    }
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Proses Permohonan
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ─────────── TABEL ─────────── */}
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-slate-700" />
            <h2 className="font-semibold text-slate-900">Daftar Permohonan</h2>
            {!loading && (
              <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {total} data
              </span>
            )}
          </div>

          {/* Filter & search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex flex-wrap gap-1">
              {[['', 'Semua'], ...STATUS_KEYS.map((k) => [k, STATUS[k].label])].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    statusFilter === val
                      ? 'bg-primary text-primary-foreground border-transparent'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'
                  }`}
                >
                  {label}
                  {counts[val] !== undefined && (
                    <span
                      className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                        statusFilter === val ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {counts[val]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                load(1);
              }}
              className="flex gap-2 flex-1"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Cari no. register / nama / NIK / HP / jenis…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Baris filter kedua: periode (dropdown + geser rentang) & petugas */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start">
            <FilterPeriode
              periode={periode}
              acuan={acuan}
              onPeriodeChange={setPeriode}
              onAcuanChange={setAcuan}
              disabled={loading}
            />

            {daftarPetugas.length > 0 && (
              <div className="flex items-center gap-2 lg:ml-auto">
                <span className="text-xs font-medium text-slate-400">Petugas</span>
                <Select
                  value={petugas || SEMUA_PETUGAS}
                  onValueChange={(v) => setPetugas(v === SEMUA_PETUGAS ? '' : v)}
                >
                  <SelectTrigger className="h-9 w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEMUA_PETUGAS}>Semua petugas</SelectItem>
                    {daftarPetugas.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">Tidak ada permohonan.</div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4 font-medium">No. Register</th>
                    <th className="py-2 pr-4 font-medium">Pemohon</th>
                    <th className="py-2 pr-4 font-medium">Jenis</th>
                    <th className="py-2 pr-4 font-medium">Dibuat</th>
                    <th className="py-2 pr-4 font-medium">Perubahan Status</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr
                      key={it.id}
                      id={`permohonan-${it.id}`}
                      className={`border-b border-slate-100 align-top transition-colors ${
                        sorotId === it.id ? 'baris-disorot' : ''
                      }`}
                    >
                      <td className="py-2.5 pr-4 font-mono text-xs">{it.noregister}</td>
                      <td className="py-2.5 pr-4">
                        <div>{it.pemohon}</div>
                        <div className="text-xs text-slate-400 font-mono">{it.pemohonId}</div>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div>{it.jenisNama}</div>
                        <div className="text-xs text-slate-400">{it.kategori} &middot; {it.jumlahBerkas} berkas</div>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-slate-500">
                        {new Date(it.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 pr-4 text-xs">
                        {it.prosesAt ? (
                          <>
                            <div className="text-slate-600">
                              {new Date(it.prosesAt).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </div>
                            {it.prosesByName && (
                              <div className="text-slate-400">oleh {it.prosesByName}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4"><StatusBadge status={it.status} /></td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          {/* Proses dilakukan dari DETAIL — baca data & berkas dulu. */}
                          <Button size="sm" variant="outline" onClick={() => openDetail(it)} title="Lihat detail, berkas & proses">
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> Detail
                          </Button>
                          {FINAL_STATUS.includes(it.status) && (
                            <span className="text-slate-300" title="Permohonan final — buka kunci lewat halaman Master">
                              <Lock className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalHalaman={totalHalaman}
              total={total}
              limit={20}
              onChange={gantiHalaman}
              disabled={loading}
            />
            </>
          )}
        </>
      )}

      {/* Modal edit status */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeEdit}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Proses Permohonan</h3>
                <p className="text-xs text-slate-500 font-mono">{editing.noregister}</p>
              </div>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <p><span className="text-slate-500">Pemohon:</span> {editing.pemohon}</p>
                <p><span className="text-slate-500">Jenis:</span> {editing.jenisNama}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {STATUS_KEYS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setEditStatus(k);
                        // Keluar dari DITOLAK -> reset pilihan alasan.
                        if (k !== 'DITOLAK') setRejectPreset('');
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        editStatus === k ? STATUS[k].cls : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {STATUS[k].label}
                    </button>
                  ))}
                </div>
              </div>

              {editStatus === 'DITOLAK' ? (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Alasan Penolakan <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={rejectPreset}
                    onValueChange={(v) => {
                      setRejectPreset(v);
                      // Preset langsung jadi catatan; "Lainnya" -> kosongkan utk diketik.
                      setEditCatatan(v === 'Lainnya' ? '' : v);
                    }}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Pilih alasan penolakan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ALASAN_TOLAK.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {rejectPreset === 'Lainnya' && (
                    <Textarea
                      className="mt-2"
                      rows={3}
                      value={editCatatan}
                      onChange={(e) => setEditCatatan(e.target.value)}
                      placeholder="Tulis alasan penolakan..."
                      autoFocus
                    />
                  )}
                  <p className="mt-1.5 text-xs text-slate-400">Alasan ini dikirim ke pemohon sebagai catatan.</p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-slate-700">Catatan Petugas</label>
                  <Textarea
                    className="mt-1.5"
                    rows={3}
                    value={editCatatan}
                    onChange={(e) => setEditCatatan(e.target.value)}
                    placeholder="Catatan untuk pemohon (opsional)..."
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeEdit}>Batal</Button>
                <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span className={saving ? 'ml-1.5' : ''}>Simpan</span>
                </Button>
              </div>
            </div>

            {/* Konfirmasi ekstra: status final mengunci data */}
            {confirmFinal && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/50 p-4"
                onClick={() => setConfirmFinal(false)}
              >
                <div
                  className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-3 flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    <h4 className="font-semibold text-slate-900">
                      Jadikan {STATUS[editStatus]?.label ?? editStatus}?
                    </h4>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Setelah status diubah menjadi <b>{STATUS[editStatus]?.label}</b>,
                    permohonan ini <b>terkunci dan tidak dapat diubah lagi</b> —
                    tombol Proses akan hilang. Membuka kunci hanya bisa
                    dilakukan lewat <b>halaman Master</b>.
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setConfirmFinal(false)}>
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={save}
                      disabled={saving}
                      className={
                        editStatus === 'DITOLAK'
                          ? 'bg-destructive text-white hover:bg-destructive/90'
                          : 'bg-success text-white hover:bg-success/90'
                      }
                    >
                      {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                      Ya, saya mengerti
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
