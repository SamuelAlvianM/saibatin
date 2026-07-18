'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  ArrowLeft,
  Upload,
  CheckCircle2,
  X,
  Send,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  OcrUploadButton,
  type OcrUploadResult,
} from '@/components/permohonan-online/ocr-upload-button';
import type { LayananForm, FieldDef } from '@/lib/layanan-forms';

interface Props {
  layanan: LayananForm;
  onBack: () => void;
  onSuccess?: (noregister: string) => void;
}

type Values = Record<string, string>;

// ── Validasi per tipe ──
function validateField(fd: FieldDef, value: string): string | null {
  const v = (value ?? '').trim();
  if (fd.required && !v) return `${fd.label} wajib diisi`;
  if (!v) return null;
  switch (fd.type) {
    case 'nik':
    case 'kk':
      if (!/^\d{16}$/.test(v)) return `${fd.label} harus 16 digit angka`;
      break;
    case 'phone':
      if (!/^0\d{9,12}$/.test(v)) return `${fd.label} harus 10–13 digit dan diawali 0`;
      break;
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `Format ${fd.label} tidak valid`;
      break;
  }
  return null;
}

export function StaffPengajuanForm({ layanan, onBack, onSuccess }: Props) {
  const [values, setValues] = useState<Values>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const allFields = useMemo(
    () => layanan.sections.flatMap((s) => s.fields),
    [layanan]
  );

  const setVal = (name: string, value: string) => {
    setValues((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleFile = async (fd: FieldDef, file: File | undefined) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    const okType = ['image/jpeg', 'image/png'].includes(file.type);
    if (!okType) {
      toast.error(`${fd.label}: format harus JPG atau PNG`);
      return;
    }
    if (file.size > maxSize) {
      toast.error(`${fd.label}: ukuran maksimal 5 MB`);
      return;
    }
    setUploading(fd.name);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/${layanan.slug}/upload`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.error?.length) {
        toast.error(json.error[0]);
      } else {
        const url = json.success?.[0] ?? json.data?.url ?? '';
        setVal(fd.name, url);
        setFileNames((p) => ({ ...p, [fd.name]: file.name }));
        toast.success(`${fd.label} berhasil diunggah`);
      }
    } catch {
      toast.error(`Gagal mengunggah ${fd.label}`);
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (name: string) => {
    setVal(name, '');
    setFileNames((p) => {
      const n = { ...p };
      delete n[name];
      return n;
    });
  };

  const submit = async () => {
    // Validasi seluruh field, kumpulkan alasan
    const nextErrors: Record<string, string> = {};
    for (const fd of allFields) {
      const err = validateField(fd, values[fd.name] ?? '');
      if (err) nextErrors[fd.name] = err;
    }
    setErrors(nextErrors);

    const reasons = Object.values(nextErrors);
    if (reasons.length) {
      toast.error(
        `${reasons.length} data belum lengkap`,
        { description: reasons.slice(0, 4).join(' • ') + (reasons.length > 4 ? ' …' : '') }
      );
      // Scroll ke field bermasalah pertama
      const first = allFields.find((fd) => nextErrors[fd.name]);
      if (first) document.getElementById(`fld-${first.name}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/${layanan.slug}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.error?.length) {
        toast.error('Gagal mengajukan permohonan', { description: json.error[0] });
      } else {
        const noreg = json.data?.noregister ?? '';
        toast.success('Permohonan berhasil diajukan', {
          description: noreg ? `No. Register: ${noreg}` : undefined,
        });
        onSuccess?.(noreg);
        onBack();
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan saat mengirim permohonan');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (fd: FieldDef) => {
    const err = errors[fd.name];
    const val = values[fd.name] ?? '';
    const errCls = err ? 'border-destructive focus-visible:ring-destructive/40' : '';

    if (fd.type === 'file') {
      const uploaded = !!val;
      return (
        <div id={`fld-${fd.name}`} className={cn('space-y-1.5', fd.half ? '' : 'sm:col-span-2')}>
          <Label>
            {fd.label} {fd.required && <span className="text-destructive">*</span>}
            <span className="ml-1 text-xs font-normal text-slate-400">(JPG/PNG, maks 5MB)</span>
          </Label>
          {uploaded ? (
            <div className="flex items-center justify-between rounded-lg border-2 border-success/40 bg-success/5 p-3">
              <span className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> {fileNames[fd.name] ?? 'Terunggah'}
              </span>
              <button type="button" onClick={() => removeFile(fd.name)} className="text-slate-400 hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              className={cn(
                'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed py-4 text-sm text-slate-400 transition-colors hover:border-primary/40 hover:text-primary',
                err ? 'border-destructive/50 text-destructive' : 'border-slate-200'
              )}
            >
              {uploading === fd.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{uploading === fd.name ? 'Mengunggah...' : 'Pilih file'}</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                disabled={uploading === fd.name}
                onChange={(e) => handleFile(fd, e.target.files?.[0])}
              />
            </label>
          )}
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      );
    }

    return (
      <div id={`fld-${fd.name}`} className={cn('space-y-1.5', fd.half ? '' : 'sm:col-span-2')}>
        <Label htmlFor={fd.name}>
          {fd.label} {fd.required && <span className="text-destructive">*</span>}
        </Label>
        {fd.type === 'textarea' ? (
          <Textarea id={fd.name} rows={3} value={val} placeholder={fd.placeholder} className={errCls} onChange={(e) => setVal(fd.name, e.target.value)} />
        ) : fd.type === 'select' ? (
          <Select value={val} onValueChange={(v) => setVal(fd.name, v)}>
            <SelectTrigger id={fd.name} className={cn('w-full', errCls)}>
              <SelectValue placeholder="— Pilih —" />
            </SelectTrigger>
            <SelectContent>
              {fd.options?.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : fd.type === 'date' ? (
          <DatePicker
            id={fd.name}
            value={val}
            onChange={(v) => setVal(fd.name, v)}
            placeholder={fd.placeholder ?? 'Pilih tanggal'}
            className={errCls}
          />
        ) : (
          <div className={cn(fd.type === 'nik' || fd.type === 'kk' ? 'flex gap-2' : undefined)}>
            <Input
              id={fd.name}
              type={fd.type === 'number' ? 'number' : 'text'}
              inputMode={['nik', 'kk', 'phone'].includes(fd.type) ? 'numeric' : undefined}
              maxLength={fd.type === 'nik' || fd.type === 'kk' ? 16 : fd.type === 'phone' ? 13 : undefined}
              value={val}
              placeholder={fd.placeholder}
              className={cn(errCls, (fd.type === 'nik' || fd.type === 'kk') && 'flex-1')}
              onChange={(e) => {
                let v = e.target.value;
                if (['nik', 'kk', 'phone'].includes(fd.type)) v = v.replace(/\D/g, '');
                setVal(fd.name, v);
              }}
            />
            {(fd.type === 'nik' || fd.type === 'kk') && (
              <OcrUploadButton
                docLabel={fd.type === 'kk' ? 'KK' : 'KTP'}
                onResult={(r: OcrUploadResult) => {
                  const v = fd.type === 'kk' ? r.nokk || r.nik : r.nik;
                  if (v) setVal(fd.name, v);
                }}
              />
            )}
          </div>
        )}
        {err && <p className="text-xs text-destructive">{err}</p>}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header + back */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FileText className="h-5 w-5 text-primary" /> {layanan.title}
          </h2>
          <p className="text-sm text-slate-500">{layanan.desc}</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary mb-6">
        Anda mengisi permohonan <b>atas nama warga</b>. Pastikan data sesuai dokumen asli sebelum dikirim.
      </div>

      <div className="space-y-6">
        {layanan.sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{section.title}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.fields.map((fd) => (
                <div key={fd.name} className={fd.half ? '' : 'sm:col-span-2'}>
                  {renderField(fd)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onBack}>Batal</Button>
        <Button onClick={submit} disabled={submitting || !!uploading} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? 'Mengirim...' : 'Kirim Permohonan'}
        </Button>
      </div>
    </div>
  );
}
