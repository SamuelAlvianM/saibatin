'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RotateCcw, ImageUp, Loader2, CheckCircle2 } from 'lucide-react';

/**
 * Pengambil foto wajah/selfie untuk pendaftaran akun.
 *
 * Hasilnya berupa data URL JPEG yang ikut dikirim bersama formulir — pada saat
 * warga memotret, akunnya belum ada sehingga belum ada sesi untuk memakai
 * endpoint unggah biasa. Server yang menyimpannya ke disk setelah akun dibuat.
 *
 * Gambar dikecilkan di sisi klien (maks 720px) supaya payload pendaftaran tetap
 * ringan; foto mentah dari webcam/HP bisa beberapa MB dan akan membengkak ~33%
 * lagi saat di-encode base64.
 */

const MAKS_SISI = 720;
const MUTU_JPEG = 0.82;

/** Skalakan sumber gambar ke JPEG data URL, sisi terpanjang maks `MAKS_SISI`. */
function keDataUrl(
  sumber: HTMLVideoElement | HTMLImageElement,
  lebarAsli: number,
  tinggiAsli: number,
  cermin: boolean,
): string {
  const skala = Math.min(1, MAKS_SISI / Math.max(lebarAsli, tinggiAsli));
  const w = Math.round(lebarAsli * skala);
  const h = Math.round(tinggiAsli * skala);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Pratinjau kamera depan ditampilkan seperti cermin; hasil foto dibuat sama
  // persis agar tidak terasa "terbalik" dibanding yang tadi dilihat.
  if (cermin) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(sumber, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', MUTU_JPEG);
}

interface CameraCaptureProps {
  value: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
  /** Sembunyikan tombol unggah berkas (mis. bila memang wajib dari kamera). */
  tanpaUnggah?: boolean;
}

export function CameraCapture({
  value,
  onChange,
  disabled,
  tanpaUnggah,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [aktif, setAktif] = useState(false);
  const [menyiapkan, setMenyiapkan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const matikanKamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setAktif(false);
  }, []);

  // Kamera wajib mati saat komponen dilepas — kalau tidak, lampu indikator
  // tetap menyala setelah pengguna pindah halaman.
  useEffect(() => () => matikanKamera(), [matikanKamera]);

  const nyalakanKamera = async () => {
    setGalat(null);
    setMenyiapkan(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setAktif(true);
      // Elemen <video> baru dirender setelah `aktif` true, jadi pemasangan
      // stream menunggu satu putaran render.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (err) {
      const nama = (err as DOMException)?.name;
      setGalat(
        nama === 'NotAllowedError'
          ? 'Akses kamera ditolak. Mohon izinkan akses kamera pada browser untuk dapat mengambil foto wajah.'
          : nama === 'NotFoundError' || nama === 'DevicesNotFoundError'
            ? tanpaUnggah
              ? 'Kamera tidak terdeteksi pada perangkat ini. Silakan mendaftar dari perangkat berkamera (mis. ponsel).'
              : 'Kamera tidak terdeteksi pada perangkat ini. Silakan gunakan perangkat berkamera atau unggah foto.'
            : 'Kamera tidak dapat digunakan. Pastikan tidak sedang dipakai aplikasi lain.',
      );
    } finally {
      setMenyiapkan(false);
    }
  };

  const ambilFoto = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    onChange(keDataUrl(v, v.videoWidth, v.videoHeight, true));
    matikanKamera();
  };

  const ulangi = () => {
    onChange('');
    nyalakanKamera();
  };

  const pilihBerkas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // izinkan memilih berkas yang sama lagi
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setGalat('Berkas harus berupa gambar.');
      return;
    }
    const img = new Image();
    img.onload = () => {
      setGalat(null);
      onChange(keDataUrl(img, img.naturalWidth, img.naturalHeight, false));
      URL.revokeObjectURL(img.src);
      matikanKamera();
    };
    img.onerror = () => setGalat('Gambar tidak dapat dibaca.');
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="space-y-3">
      {/* Bingkai 4:3 — ukurannya tetap di ketiga keadaan supaya tata letak
          tidak melompat saat kamera menyala atau foto diambil. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Foto wajah yang diambil" className="h-full w-full object-cover" />
        ) : aktif ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            {galat ? (
              <>
                <CameraOff className="h-8 w-8 text-destructive/70" />
                <p className="text-xs leading-relaxed text-destructive">{galat}</p>
              </>
            ) : (
              <>
                <Camera className="h-8 w-8 text-slate-400" />
                <p className="text-xs text-slate-500">
                  Kamera belum aktif. Tekan <b>Nyalakan Kamera</b> untuk mulai.
                </p>
              </>
            )}
          </div>
        )}

        {/* Panduan posisi wajah — hanya saat kamera hidup. */}
        {aktif && !value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[78%] w-[52%] rounded-[50%] border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]" />
          </div>
        )}

        {value && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-success/90 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
            <CheckCircle2 className="h-3 w-3" /> Foto siap
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {value ? (
          <Button type="button" variant="outline" onClick={ulangi} disabled={disabled}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Ulangi
          </Button>
        ) : aktif ? (
          <>
            <Button type="button" onClick={ambilFoto} disabled={disabled}>
              <Camera className="mr-1.5 h-4 w-4" />
              Ambil Foto
            </Button>
            <Button type="button" variant="ghost" onClick={matikanKamera} disabled={disabled}>
              Batal
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={nyalakanKamera}
            disabled={disabled || menyiapkan}
          >
            {menyiapkan ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-1.5 h-4 w-4" />
            )}
            {galat ? 'Coba Lagi' : 'Nyalakan Kamera'}
          </Button>
        )}

        {!tanpaUnggah && !aktif && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
            >
              <ImageUp className="mr-1.5 h-4 w-4" />
              Unggah Foto
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={pilihBerkas}
              className="hidden"
            />
          </>
        )}
      </div>
    </div>
  );
}
