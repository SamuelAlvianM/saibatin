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
import { Loader2, Search, CheckCircle2, XCircle, Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FORM = {
  nama: '',
  userId: '',
  kk: '',
  hp: '',
  email: '',
  level: 3,
  password: '',
};

interface AdminUser {
  id: number;
  userId: string;
  userlevelId: number;
  userFullname: string | null;
  userNik: string | null;
  userHp: string | null;
  userEmail: string | null;
  status: number;
  createdAt: string;
  level: { nama: string } | null;
}

export function AdminUsers() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [statusFilter, setStatusFilter] = useState<'' | '0' | '1'>('');
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [creating, setCreating] = useState(false);
  const myLevel = useAppSelector((s) => s.auth.user?.level ?? 2);

  const load = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (q.trim()) params.set('q', q.trim());
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setIsLoading(false);
  }, [statusFilter, q]);

  useEffect(() => {
    load();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (id: number, status: number) => {
    // Saat menonaktifkan/menolak, minta alasan — dikirim ke warga via email.
    let alasan: string | undefined;
    if (status === 0) {
      const input = window.prompt(
        'Alasan penolakan/penonaktifan (dikirim ke email warga, kosongkan jika tanpa alasan):',
      );
      if (input === null) return; // batal
      alasan = input.trim() || undefined;
    }
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
    }
  };

  const createAccount = async () => {
    setCreating(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-700" />
          <h2 className="font-semibold text-slate-900">Manajemen User</h2>
        </div>
        <Button size="sm" onClick={() => { setForm({ ...EMPTY_FORM }); setCreateOpen(true); }}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Tambah Akun
        </Button>
      </div>

      {/* Filter & search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1">
          {([
            ['', 'Semua'],
            ['0', 'Belum Aktif'],
            ['1', 'Aktif'],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                statusFilter === val
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'
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
          className="flex gap-2 flex-1"
        >
          <Input
            placeholder="Cari NIK / nama / email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button type="submit" variant="outline">
            <Search className="w-4 h-4" />
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
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">
          Tidak ada user yang cocok.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">User ID / NIK</th>
                <th className="py-2 pr-4 font-medium">Nama</th>
                <th className="py-2 pr-4 font-medium">Kontak</th>
                <th className="py-2 pr-4 font-medium">Level</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-mono text-xs">{u.userId}</td>
                  <td className="py-2.5 pr-4">{u.userFullname ?? '-'}</td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">
                    {u.userEmail ?? '-'}
                    {u.userHp ? <br /> : null}
                    {u.userHp ?? ''}
                  </td>
                  <td className="py-2.5 pr-4">{u.level?.nama ?? u.userlevelId}</td>
                  <td className="py-2.5 pr-4">
                    {u.status === 1 ? (
                      <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Belum Aktif
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    {u.status === 1 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, 0)}
                      >
                        {busyId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Nonaktifkan'
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-white"
                        disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, 1)}
                      >
                        {busyId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Aktifkan'
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog buat akun baru */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    [3, 'Warga', 'Masyarakat umum'],
                    [4, 'Operator OPD', 'Instansi pemerintah daerah'],
                    ...(myLevel === 1
                      ? ([[2, 'Operator', 'Petugas dinas']] as const)
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
                    <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nama Lengkap {form.level === 4 ? '/ Nama Instansi' : ''} *</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                placeholder={form.level === 4 ? 'mis. Dinas Kesehatan Pesisir Barat' : 'Nama sesuai KTP'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{form.level === 3 ? 'NIK (16 digit) *' : 'Username *'}</Label>
                <Input
                  value={form.userId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      userId: form.level === 3 ? e.target.value.replace(/\D/g, '') : e.target.value,
                    }))
                  }
                  maxLength={form.level === 3 ? 16 : 30}
                  placeholder={form.level === 3 ? '16 digit NIK' : 'mis. opd_dinkes'}
                />
              </div>
              <div className="space-y-1.5">
                <Label>No. KK {form.level === 3 ? '' : '(opsional)'}</Label>
                <Input
                  value={form.kk}
                  onChange={(e) => setForm((f) => ({ ...f, kk: e.target.value.replace(/\D/g, '') }))}
                  maxLength={16}
                  placeholder="16 digit nomor KK"
                />
              </div>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Batal
            </Button>
            <Button onClick={createAccount} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Buat Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
