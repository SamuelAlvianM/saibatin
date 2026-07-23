'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Users,
  UserPlus,
  X,
  UserRound,
  KeyRound,
  Camera,
  MapPin,
  ChevronRight,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { CameraCapture } from '@/components/shared/camera-capture';
import { SearchSelect } from '@/components/shared/search-select';
import { useMediaQuery } from '@/lib/use-media-query';

const EMPTY_FORM = {
  nama: '',
  userId: '',
  nik: '', // NIK perwakilan instansi (khusus OPD)
  kk: '', // No. KK (khusus warga)
  hp: '',
  email: '',
  level: 3,
  password: '',
  kecamatan: '', // domisili (khusus warga)
};

interface AdminUser {
  id: number;
  userId: string;
  userlevelId: number;
  userFullname: string | null;
  userNik: string | null;
  userNokk: string | null;
  userHp: string | null;
  userEmail: string | null;
  userKecamatan: string | null;
  userFoto: string | null;
  status: number;
  createdAt: string;
  level: { nama: string } | null;
}

interface PermohonanRingkas {
  id: number;
  noregister: string;
  status: string;
  createdAt: string;
  jenisNama: string;
}

interface DetailUser extends AdminUser {
  ket: string | null;
  ipAddress: string | null;
  loginLast: string | null;
  activationTime: string | null;
  updatedAt: string;
  jumlahPermohonan: number;
  permohonanTerakhir: PermohonanRingkas[];
}

interface Kecamatan {
  id: number;
  nama: string;
}

// Kelompok akun (tab): warga, operator OPD, dan staff dinas (level 1 & 2).
const GRUP_AKUN = [
  { key: '3', label: 'Warga', desc: 'Masyarakat umum (NIK)' },
  { key: '4', label: 'OPD', desc: 'Operator instansi pemerintah daerah' },
  { key: 'staff', label: 'Staff', desc: 'Petugas dinas (admin & operator)' },
] as const;
type GrupKey = (typeof GRUP_AKUN)[number]['key'];

const fmtTanggal = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const STATUS_PERMOHONAN: Record<string, string> = {
  MENUNGGU: 'bg-amber-50 text-amber-700 ring-amber-100',
  DIPROSES: 'bg-sky-50 text-sky-700 ring-sky-100',
  SELESAI: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  DITOLAK: 'bg-rose-50 text-rose-700 ring-rose-100',
};

/** Satu baris "label — nilai" di panel detail. */
function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2 py-1.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-slate-800">{children}</dd>
    </div>
  );
}

/** Isi panel detail — dipakai panel samping (desktop) maupun modal (mobile). */
function IsiDetail({ detail, memuat }: { detail: DetailUser | null; memuat: boolean }) {
  if (memuat || !detail) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Identitas ringkas */}
      <div className="flex items-start gap-4">
        {detail.userFoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={detail.userFoto}
            alt={`Foto ${detail.userFullname ?? detail.userId}`}
            className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-300">
            <UserRound className="h-8 w-8" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">
            {detail.userFullname ?? detail.userId}
          </p>
          <p className="font-mono text-xs text-slate-500">{detail.userId}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.68rem] font-medium text-slate-600">
              {detail.level?.nama ?? `Level ${detail.userlevelId}`}
            </span>
            {detail.status === 1 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[0.68rem] font-semibold text-success">
                <CheckCircle2 className="h-3 w-3" /> Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[0.68rem] font-semibold text-warning">
                <XCircle className="h-3 w-3" /> Belum Aktif
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Data diri */}
      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Data Diri
        </h4>
        <dl className="divide-y divide-slate-100">
          <Baris label="NIK">{detail.userNik ?? '-'}</Baris>
          <Baris label="No. KK">{detail.userNokk ?? '-'}</Baris>
          <Baris label="Kecamatan">{detail.userKecamatan ?? '-'}</Baris>
          <Baris label="WhatsApp">{detail.userHp ?? '-'}</Baris>
          <Baris label="Email">{detail.userEmail ?? '-'}</Baris>
        </dl>
      </div>

      {/* Riwayat akun */}
      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Riwayat Akun
        </h4>
        <dl className="divide-y divide-slate-100">
          <Baris label="Terdaftar">{fmtTanggal(detail.createdAt)}</Baris>
          <Baris label="Diaktifkan">{fmtTanggal(detail.activationTime)}</Baris>
          <Baris label="Login terakhir">{fmtTanggal(detail.loginLast)}</Baris>
          <Baris label="IP terakhir">{detail.ipAddress || '-'}</Baris>
          {detail.ket && <Baris label="Catatan">{detail.ket}</Baris>}
        </dl>
      </div>

      {/* Permohonan */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Permohonan ({detail.jumlahPermohonan})
        </h4>
        {detail.permohonanTerakhir.length === 0 ? (
          <p className="text-xs text-slate-400">Belum ada permohonan.</p>
        ) : (
          <ul className="space-y-1.5">
            {detail.permohonanTerakhir.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded-lg border border-slate-100 px-2.5 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700">{p.jenisNama}</p>
                  <p className="truncate font-mono text-[0.65rem] text-slate-400">
                    {p.noregister}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase ring-1 ${
                    STATUS_PERMOHONAN[p.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
                  }`}
                >
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
        {detail.jumlahPermohonan > 0 && (
          <a
            href={`/dashboard/permohonan?q=${encodeURIComponent(detail.userId)}`}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Lihat semua permohonan <ChevronRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [grup, setGrup] = useState<GrupKey>('3');
  const [statusFilter, setStatusFilter] = useState<'' | '0' | '1'>('');
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [foto, setFoto] = useState('');
  const [creating, setCreating] = useState(false);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const myLevel = useAppSelector((s) => s.auth.user?.level ?? 2);

  // Panel detail
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<DetailUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const layarLebar = useMediaQuery('(min-width: 1024px)');

  // Konfirmasi tindakan berisiko — memakai modal, bukan window.prompt/confirm.
  const [konfirmasi, setKonfirmasi] = useState<{
    tipe: 'nonaktif' | 'hapus';
    user: AdminUser;
  } | null>(null);
  const [alasan, setAlasan] = useState('');
  const [jeda, setJeda] = useState(0);

  // Tombol hapus baru bisa ditekan setelah beberapa detik — jeda singkat ini
  // mencegah penghapusan permanen karena klik refleks/dobel klik.
  useEffect(() => {
    if (konfirmasi?.tipe !== 'hapus') return;
    setJeda(3);
    const t = setInterval(() => setJeda((d) => (d <= 1 ? 0 : d - 1)), 1000);
    return () => clearInterval(t);
  }, [konfirmasi]);

  const load = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set('level', grup);
    if (statusFilter) params.set('status', statusFilter);
    if (q.trim()) params.set('q', q.trim());
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setIsLoading(false);
  }, [grup, statusFilter, q]);

  useEffect(() => {
    load();
  }, [grup, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pindah tab/filter → detail lama tidak lagi relevan.
  useEffect(() => {
    setDetailId(null);
  }, [grup, statusFilter]);

  useEffect(() => {
    fetch('/api/wilayah?jenis=KECAMATAN')
      .then((r) => r.json())
      .then((j) => setKecamatanList(j.data?.items ?? []))
      .catch(() => setKecamatanList([]));
  }, []);

  // Ambil detail saat baris dibuka.
  useEffect(() => {
    if (detailId == null) {
      setDetail(null);
      return;
    }
    let batal = false;
    setDetailLoading(true);
    fetch(`/api/admin/users/${detailId}`)
      .then((r) => r.json())
      .then((j) => {
        if (batal) return;
        if (j.error?.length) {
          toast.error(j.error[0]);
          setDetailId(null);
          return;
        }
        setDetail(j.data ?? null);
      })
      .finally(() => !batal && setDetailLoading(false));
    return () => {
      batal = true;
    };
  }, [detailId]);

  const setStatus = async (id: number, status: number, alasan?: string) => {
    setBusyId(id);
    setMessage(null);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, alasan }),
    });
    const json = await res.json();
    setBusyId(null);
    if (json.error?.length) {
      setMessage(json.error[0]);
      toast.error(json.error[0]);
    } else {
      const msg = json.success?.[0] ?? (status === 1 ? 'Akun diaktifkan' : 'Akun dinonaktifkan');
      setMessage(msg);
      toast.success(msg);
      setItems((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
      // Panel detail ikut menyesuaikan agar tidak menampilkan status basi.
      setDetail((d) => (d && d.id === id ? { ...d, status } : d));
    }
  };

  const createAccount = async () => {
    setCreating(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, foto: foto || undefined }),
    });
    const json = await res.json();
    setCreating(false);
    if (json.error?.length) {
      toast.error(json.error[0]);
      return;
    }
    toast.success(json.success?.[0] ?? 'Akun berhasil dibuat');
    setCreateOpen(false);
    load();
  };

  const hapusAkun = async (id: number) => {
    setBusyId(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const json = await res.json();
    setBusyId(null);
    if (json.error?.length) {
      toast.error(json.error[0]);
      return;
    }
    toast.success(json.success?.[0] ?? 'Akun dihapus');
    setItems((prev) => prev.filter((u) => u.id !== id));
    if (detailId === id) setDetailId(null);
    setKonfirmasi(null);
  };

  const bukaFormBaru = () => {
    setForm({ ...EMPTY_FORM });
    setFoto('');
    setCreateOpen(true);
  };

  const grupAktif = GRUP_AKUN.find((g) => g.key === grup)!;
  const warga = form.level === 3;
  // Tabel menyempit saat detail terbuka; kolom sekunder disembunyikan supaya
  // sisanya tidak berdesakan.
  const ringkas = detailId !== null && layarLebar;

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className={ringkas ? 'lg:col-span-2' : 'lg:col-span-4'}>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-700" />
              <h2 className="font-semibold text-slate-900">Daftar Akun</h2>
            </div>
            <Button size="sm" onClick={bukaFormBaru}>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Tambah Akun
            </Button>
          </div>

          {/* Tab kelompok akun: Warga / OPD / Staff */}
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
            {GRUP_AKUN.map((g) => (
              <button
                key={g.key}
                onClick={() => setGrup(g.key)}
                title={g.desc}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  grup === g.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g.label}
              </button>
            ))}
            {!ringkas && <span className="ml-1 text-xs text-slate-400">{grupAktif.desc}</span>}
          </div>

          {/* Filter & search */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex gap-1">
              {(
                [
                  ['', 'Semua'],
                  ['0', 'Belum Aktif'],
                  ['1', 'Aktif'],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    statusFilter === val
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                load();
              }}
              className="flex flex-1 gap-2"
            >
              <Input
                placeholder="Cari NIK / nama / email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {message && (
            <Alert className="mb-4 border-warning/20 bg-warning/10">
              <AlertDescription className="text-slate-800">{message}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada user yang cocok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 pr-4 font-medium">User ID / NIK</th>
                    <th className="py-2 pr-4 font-medium">Nama</th>
                    {!ringkas && <th className="py-2 pr-4 font-medium">Kontak</th>}
                    {!ringkas && <th className="py-2 pr-4 font-medium">Level</th>}
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setDetailId(u.id)}
                      title="Klik untuk melihat detail akun"
                      className={`cursor-pointer border-b border-slate-100 transition-colors ${
                        detailId === u.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 pr-4 font-mono text-xs">{u.userId}</td>
                      <td className="py-2.5 pr-4">
                        <span className="flex items-center gap-2">
                          {u.userFoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.userFoto}
                              alt=""
                              className="h-7 w-7 shrink-0 rounded-full object-cover"
                            />
                          ) : null}
                          <span className="min-w-0 truncate">{u.userFullname ?? '-'}</span>
                        </span>
                      </td>
                      {!ringkas && (
                        <td className="py-2.5 pr-4 text-xs text-slate-500">
                          {u.userEmail ?? '-'}
                          {u.userHp ? <br /> : null}
                          {u.userHp ?? ''}
                        </td>
                      )}
                      {!ringkas && (
                        <td className="py-2.5 pr-4">{u.level?.nama ?? u.userlevelId}</td>
                      )}
                      <td className="py-2.5 pr-4">
                        {u.status === 1 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                            <XCircle className="h-3.5 w-3.5" /> Belum Aktif
                          </span>
                        )}
                      </td>
                      {/* Tombol aksi tidak boleh ikut membuka panel detail. */}
                      <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {u.status === 1 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === u.id}
                              onClick={() => {
                                setAlasan('');
                                setKonfirmasi({ tipe: 'nonaktif', user: u });
                              }}
                            >
                              {busyId === u.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Nonaktifkan'
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-success text-white hover:bg-success/90"
                              disabled={busyId === u.id}
                              onClick={() => setStatus(u.id, 1)}
                            >
                              {busyId === u.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Aktifkan'
                              )}
                            </Button>
                          )}

                          {/* Hapus permanen — hanya Super Admin. */}
                          {myLevel === 1 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Hapus akun permanen"
                              aria-label={`Hapus akun ${u.userFullname ?? u.userId}`}
                              disabled={busyId === u.id}
                              onClick={() => setKonfirmasi({ tipe: 'hapus', user: u })}
                              className="text-slate-400 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Panel detail — layar lebar saja; di mobile memakai modal di bawah. */}
      {ringkas && (
        <aside className="lg:col-span-2">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-slate-900">Detail Akun</h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDetailId(null)}
                aria-label="Tutup detail"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <IsiDetail detail={detail} memuat={detailLoading} />
          </div>
        </aside>
      )}

      {/* Detail versi mobile */}
      <Dialog
        open={detailId !== null && !layarLebar}
        // Hanya penutupan yang benar-benar dilakukan pengguna yang mengosongkan
        // detail. Tanpa penjaga `!layarLebar`, melebarkan jendela membuat modal
        // ini "tertutup" sendiri dan detail yang seharusnya pindah ke panel
        // samping ikut hilang.
        onOpenChange={(o) => {
          if (!o && !layarLebar) setDetailId(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Akun</DialogTitle>
          </DialogHeader>
          <IsiDetail detail={detail} memuat={detailLoading} />
        </DialogContent>
      </Dialog>

      {/* Konfirmasi nonaktifkan / hapus — menggantikan window.prompt & confirm
          bawaan peramban yang tampilannya tidak menyatu dengan dashboard. */}
      <Dialog open={!!konfirmasi} onOpenChange={(o) => !o && setKonfirmasi(null)}>
        <DialogContent className="sm:max-w-md">
          {konfirmasi?.tipe === 'nonaktif' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-warning" />
                  Nonaktifkan Akun
                </DialogTitle>
                <DialogDescription>
                  <b>{konfirmasi.user.userFullname ?? konfirmasi.user.userId}</b> tidak
                  akan bisa masuk lagi sampai diaktifkan kembali. Riwayat
                  permohonannya tetap tersimpan.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-1.5">
                <Label htmlFor="alasan">Alasan penolakan/penonaktifan</Label>
                <Textarea
                  id="alasan"
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  rows={3}
                  placeholder="mis. Data NIK tidak sesuai dengan Kartu Keluarga"
                />
                <p className="text-[0.7rem] text-muted-foreground">
                  Dikirim ke email pemilik akun. Boleh dikosongkan.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setKonfirmasi(null)}>
                  Batal
                </Button>
                <Button
                  className="bg-warning text-white hover:bg-warning/90"
                  disabled={busyId === konfirmasi.user.id}
                  onClick={() => {
                    const u = konfirmasi.user;
                    setKonfirmasi(null);
                    setStatus(u.id, 0, alasan.trim() || undefined);
                  }}
                >
                  Nonaktifkan
                </Button>
              </DialogFooter>
            </>
          ) : konfirmasi?.tipe === 'hapus' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Hapus Akun Permanen
                </DialogTitle>
                <DialogDescription>
                  Akun{' '}
                  <b>{konfirmasi.user.userFullname ?? konfirmasi.user.userId}</b>{' '}
                  <span className="font-mono text-xs">({konfirmasi.user.userId})</span>{' '}
                  akan dihapus beserta foto dan notifikasinya.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 rounded-xl border border-destructive/25 bg-destructive/5 p-3.5">
                <p className="text-xs leading-relaxed text-slate-700">
                  <b>Tindakan ini tidak dapat dibatalkan.</b> Akun yang sudah
                  pernah mengajukan permohonan akan ditolak oleh sistem — untuk
                  kasus itu gunakan <b>Nonaktifkan</b> agar arsip pelayanan tetap
                  utuh.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setKonfirmasi(null)}>
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  disabled={jeda > 0 || busyId === konfirmasi.user.id}
                  onClick={() => hapusAkun(konfirmasi.user.id)}
                >
                  {busyId === konfirmasi.user.id ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 h-4 w-4" />
                  )}
                  {jeda > 0 ? `Tunggu ${jeda} detik…` : 'Ya, Hapus Permanen'}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Dialog buat akun baru */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Tambah Akun Baru
            </DialogTitle>
            <DialogDescription>
              Akun yang dibuat petugas langsung aktif. Pemberitahuan dikirim ke
              email jika diisi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Jenis Akun</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(
                  [
                    [3, 'Warga', 'Masyarakat umum'],
                    [4, 'OPD', 'Instansi pemerintah daerah'],
                    ...(myLevel === 1
                      ? ([[2, 'Staff', 'Petugas dinas']] as const)
                      : []),
                  ] as const
                ).map(([val, label, desc]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, level: val }))}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      form.level === val
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                        : 'border-slate-200 hover:border-primary/40'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Akun WARGA: bidang isian mengikuti formulir pendaftaran mandiri ── */}
            {warga ? (
              <>
                <section className="space-y-4 rounded-xl border border-slate-200 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <UserRound className="h-4 w-4 text-primary" /> Informasi Personal
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>NIK *</Label>
                      <Input
                        value={form.userId}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, userId: e.target.value.replace(/\D/g, '') }))
                        }
                        maxLength={16}
                        inputMode="numeric"
                        placeholder="Nomor Induk Kependudukan"
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        16 digit angka sesuai KTP — dipakai sebagai identitas login.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Nomor Kartu Keluarga</Label>
                      <Input
                        value={form.kk}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, kk: e.target.value.replace(/\D/g, '') }))
                        }
                        maxLength={16}
                        inputMode="numeric"
                        placeholder="Nomor Kartu Keluarga"
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        16 digit angka sesuai Kartu Keluarga.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Nama Lengkap *</Label>
                      <Input
                        value={form.nama}
                        onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                        placeholder="NAMA LENGKAP"
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        Sesuai KTP, tanpa gelar, tulis dengan huruf kapital.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Kecamatan *</Label>
                      <SearchSelect
                        value={form.kecamatan}
                        onValueChange={(v) => setForm((f) => ({ ...f, kecamatan: v }))}
                        options={kecamatanList.map((k) => ({ value: k.nama, label: k.nama }))}
                        placeholder="Pilih Kecamatan"
                        searchPlaceholder="Cari kecamatan…"
                        emptyText="Kecamatan tidak ditemukan."
                        icon={<MapPin className="h-4 w-4 shrink-0 text-slate-400" />}
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        Sesuai domisili dan alamat pada Kartu Keluarga.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 rounded-xl border border-slate-200 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <KeyRound className="h-4 w-4 text-primary" /> Informasi Akun
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Nomor WhatsApp</Label>
                      <Input
                        value={form.hp}
                        onChange={(e) => setForm((f) => ({ ...f, hp: e.target.value }))}
                        placeholder="08xxxxxxxxxx"
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        Dimulai angka 0, pastikan nomor aktif.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Alamat Email</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="nama@email.com"
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        Dipakai untuk notifikasi dan pengiriman dokumen jadi.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Kata Sandi Awal *</Label>
                    <Input
                      type="text"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Minimal 6 karakter, bukan angka semua"
                    />
                    <p className="text-[0.7rem] text-muted-foreground">
                      Sampaikan kata sandi ini ke pemilik akun; sarankan segera diganti
                      lewat menu pengaturan akun.
                    </p>
                  </div>
                </section>

                <section className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Camera className="h-4 w-4 text-primary" /> Foto Wajah / Selfie
                    <span className="font-normal text-muted-foreground">(opsional)</span>
                  </h4>
                  <CameraCapture value={foto} onChange={setFoto} />
                  <p className="text-[0.7rem] text-muted-foreground">
                    Ambil bila warga sedang berada di loket. Foto dipakai petugas untuk
                    mencocokkan dengan KTP sekaligus menjadi foto profil akun.
                  </p>
                </section>
              </>
            ) : (
              /* ── Akun OPD & STAFF: tetap seperti sebelumnya ── */
              <>
                <div className="space-y-1.5">
                  <Label>Nama Lengkap {form.level === 4 ? '/ Nama Instansi' : ''} *</Label>
                  <Input
                    value={form.nama}
                    onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                    placeholder={
                      form.level === 4 ? 'mis. Dinas Kesehatan Pesisir Barat' : 'Nama sesuai KTP'
                    }
                  />
                </div>

                {/* Identitas login: OPD & staff memakai username.
                    OPD juga mengisi NIK perwakilan (untuk lupa password). */}
                <div className="space-y-1.5">
                  <Label>{form.level === 4 ? 'Username Instansi *' : 'Username *'}</Label>
                  <Input
                    value={form.userId}
                    onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                    maxLength={30}
                    placeholder={form.level === 4 ? 'mis. rs.saibatin' : 'mis. staff_dinas'}
                  />
                  {form.level === 4 && (
                    <p className="text-xs text-muted-foreground">
                      Username ini yang dipakai instansi untuk <b>login</b> (4-30 karakter,
                      huruf/angka/titik/underscore/strip).
                    </p>
                  )}
                </div>

                {form.level === 4 && (
                  <div className="space-y-1.5">
                    <Label>NIK Perwakilan (16 digit) *</Label>
                    <Input
                      value={form.nik}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nik: e.target.value.replace(/\D/g, '') }))
                      }
                      maxLength={16}
                      placeholder="16 digit NIK perwakilan/penanggung jawab instansi"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dipakai untuk <b>fitur lupa password</b> akun instansi.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>No. HP</Label>
                    <Input
                      value={form.hp}
                      onChange={(e) => setForm((f) => ({ ...f, hp: e.target.value }))}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Password Awal *</Label>
                  <Input
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Minimal 6 karakter, bukan angka semua"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sampaikan password ini ke pemilik akun; sarankan segera diganti
                    lewat menu pengaturan akun.
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Batal
            </Button>
            <Button onClick={createAccount} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
