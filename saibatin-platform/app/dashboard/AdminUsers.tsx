'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, CheckCircle2, XCircle, Users } from 'lucide-react';

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
    setBusyId(id);
    setMessage(null);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    setBusyId(null);
    if (json.error?.length) {
      setMessage(json.error[0]);
    } else {
      setMessage(json.success?.[0] ?? 'Berhasil');
      setItems((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-slate-700" />
        <h2 className="font-semibold text-slate-900">Manajemen User</h2>
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
                  ? 'bg-yellow-500 text-slate-900 border-yellow-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-yellow-300'
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
        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-slate-800">{message}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
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
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
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
                        className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
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
    </div>
  );
}
