'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldEditor } from '@/components/konten/field-editor';
import { STATIC_BLOCKS, type StaticBlock } from '@/lib/static-content-registry';
import { FileText, Loader2, Pencil } from 'lucide-react';

type BlockValues = Record<string, unknown>;

/** Editor konten statis: semua blok dari registry, form dibangun dari `fields`. */
export function AdminKonten() {
  const [values, setValues] = useState<Record<string, BlockValues>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StaticBlock | null>(null);
  const [draft, setDraft] = useState<BlockValues>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/static-content')
      .then((r) => r.json())
      .then((json) => setValues(json.data?.items ?? {}))
      .finally(() => setLoading(false));
  }, []);

  const openEditor = (block: StaticBlock) => {
    setDraft(structuredClone(values[block.kunci] ?? block.defaults));
    setEditing(block);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await fetch('/api/admin/static-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kunci: editing.kunci, konten: draft }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error?.length) {
      toast.error(json.error[0]);
      return;
    }
    toast.success('Konten berhasil disimpan');
    setValues((prev) => ({ ...prev, [editing.kunci]: draft }));
    setEditing(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-5 h-5 text-slate-700" />
        <h2 className="font-semibold text-slate-900">Konten Halaman</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Ubah isi teks beranda dan profil (visi, misi, motto, maklumat, dll) tanpa
        menyentuh kode. Perubahan langsung tampil di website.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STATIC_BLOCKS.map((block) => (
            <button
              key={block.kunci}
              type="button"
              onClick={() => openEditor(block)}
              className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-primary hover:shadow-md transition-all"
            >
              <div>
                <p className="font-medium text-slate-800 group-hover:text-primary transition-colors">
                  {block.judul}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {block.deskripsi}
                </p>
              </div>
              <Pencil className="h-4 w-4 text-slate-300 group-hover:text-primary shrink-0 mt-1 transition-colors" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>{editing.judul}</DialogTitle>
                <DialogDescription>{editing.deskripsi}</DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {editing.fields.map((field) => (
                  <FieldEditor
                    key={field.name}
                    field={field}
                    value={draft[field.name]}
                    onChange={(v) => setDraft((d) => ({ ...d, [field.name]: v }))}
                  />
                ))}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                  Batal
                </Button>
                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
