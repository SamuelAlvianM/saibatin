'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CameraCapture } from '@/components/shared/camera-capture';
import { Camera, Loader2, Trash2, UserRound, Info } from 'lucide-react';

/**
 * Foto profil akun sendiri.
 *
 * `diminta` = pengguna baru saja diantar ke sini oleh login pertamanya karena
 * belum berfoto. Sifatnya anjuran: kartunya langsung terbuka dan diberi sorot,
 * tetapi tidak ada yang memaksa mengisi sebelum melanjutkan.
 */
export function FotoProfilCard({
  foto,
  diminta,
}: {
  foto: string | null;
  diminta: boolean;
}) {
  const router = useRouter();
  const [ambil, setAmbil] = useState(diminta && !foto);
  const [baru, setBaru] = useState('');
  const [sibuk, setSibuk] = useState(false);

  const simpan = async () => {
    if (!baru) return;
    setSibuk(true);
    try {
      const res = await fetch('/api/profil/foto', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foto: baru }),
      });
      const json = await res.json();
      if (json.error?.length) {
        toast.error(json.error[0]);
        return;
      }
      toast.success(json.success?.[0] ?? 'Foto profil disimpan');
      setBaru('');
      setAmbil(false);
      router.refresh();
    } catch {
      toast.error('Gagal menyimpan foto, coba lagi');
    } finally {
      setSibuk(false);
    }
  };

  const hapus = async () => {
    setSibuk(true);
    try {
      const res = await fetch('/api/profil/foto', { method: 'DELETE' });
      const json = await res.json();
      if (json.error?.length) {
        toast.error(json.error[0]);
        return;
      }
      toast.success(json.success?.[0] ?? 'Foto profil dihapus');
      router.refresh();
    } catch {
      toast.error('Gagal menghapus foto, coba lagi');
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div
      className={`glass-card mb-6 rounded-2xl p-6 md:p-8 ${
        diminta && !foto ? 'ring-2 ring-primary/40' : ''
      }`}
    >
      <div className="mb-5 flex items-center gap-2">
        <Camera className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-slate-900">Foto Profil</h2>
      </div>

      {diminta && !foto && (
        <div className="mb-5 flex gap-2.5 rounded-xl border border-primary/25 bg-primary/5 p-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-slate-600">
            Selamat datang! Lengkapi foto wajah Anda agar petugas lebih mudah
            memverifikasi permohonan. <b>Tidak wajib</b> — Anda bisa melewati
            langkah ini dan mengisinya kapan saja.
          </p>
        </div>
      )}

      {ambil ? (
        <div className="space-y-4">
          <CameraCapture value={baru} onChange={setBaru} disabled={sibuk} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={simpan} disabled={!baru || sibuk}>
              {sibuk && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Simpan Foto
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setBaru('');
                setAmbil(false);
              }}
              disabled={sibuk}
            >
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-5">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt="Foto profil Anda"
              className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-300">
              <UserRound className="h-10 w-10" />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              {foto
                ? 'Foto ini hanya terlihat oleh Anda dan petugas.'
                : 'Belum ada foto. Ambil foto wajah Anda lewat kamera perangkat.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setAmbil(true)} disabled={sibuk}>
                <Camera className="mr-1.5 h-4 w-4" />
                {foto ? 'Ganti Foto' : 'Ambil Foto'}
              </Button>
              {foto && (
                <Button
                  variant="ghost"
                  onClick={hapus}
                  disabled={sibuk}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {sibuk ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 h-4 w-4" />
                  )}
                  Hapus
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
