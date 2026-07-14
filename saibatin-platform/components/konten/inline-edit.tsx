'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
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
import { getStaticBlock } from '@/lib/static-content-registry';
import { refreshStaticContent } from '@/lib/use-static-content';
import { Pencil, PencilRuler, Loader2, Check, X } from 'lucide-react';

interface InlineEditCtx {
  /** Mode edit sedang aktif (hanya admin, di halaman publik). */
  editMode: boolean;
  openEditor: (kunci: string) => void;
}

const Ctx = createContext<InlineEditCtx>({ editMode: false, openEditor: () => {} });

export const useInlineEdit = () => useContext(Ctx);

/** Halaman yang TIDAK boleh punya mode edit inline. */
function isPublicPage(pathname: string) {
  return !['/dashboard', '/login', '/register', '/forgot-password', '/reset-password'].some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

export function InlineEditProvider({ children }: { children: ReactNode }) {
  const auth = useAppSelector((s) => s.auth);
  const isAdmin = !!auth.isAuthenticated && (auth.user?.level ?? 3) <= 2;
  const pathname = usePathname();
  const onPublic = isPublicPage(pathname);

  const [editMode, setEditMode] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Matikan mode edit bila bukan admin / pindah ke halaman non-publik.
  useEffect(() => {
    if (!isAdmin || !onPublic) setEditMode(false);
  }, [isAdmin, onPublic]);

  // ?editmode=1 → langsung aktifkan mode edit (dipakai preview iframe di
  // dashboard Konten Halaman). Dibaca dari window agar tidak perlu Suspense.
  useEffect(() => {
    if (!isAdmin || !onPublic) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('editmode') === '1') setEditMode(true);
  }, [isAdmin, onPublic, pathname]);

  const active = editMode && isAdmin && onPublic;

  return (
    <Ctx.Provider value={{ editMode: active, openEditor: setEditingKey }}>
      {children}

      {isAdmin && onPublic && (
        <EditModeToggle editMode={editMode} onToggle={() => setEditMode((v) => !v)} />
      )}

      {editingKey && (
        <BlockEditorDialog
          kunci={editingKey}
          open
          onOpenChange={(o) => !o && setEditingKey(null)}
        />
      )}
    </Ctx.Provider>
  );
}

/** Tombol melayang untuk mengaktifkan/menonaktifkan mode edit. */
function EditModeToggle({ editMode, onToggle }: { editMode: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-xl transition-all hover:scale-105',
        editMode
          ? 'bg-success text-white shadow-success/30'
          : 'bg-primary text-white shadow-primary/30',
      )}
      title={editMode ? 'Selesai mengedit' : 'Aktifkan mode edit halaman'}
    >
      {editMode ? (
        <>
          <Check className="h-4 w-4" /> Selesai Edit
        </>
      ) : (
        <>
          <PencilRuler className="h-4 w-4" /> Mode Edit
        </>
      )}
    </button>
  );
}

/** Pembungkus blok yang bisa diedit: menampilkan tombol pensil saat mode edit. */
export function EditableBlock({
  kunci,
  label,
  children,
  className,
}: {
  kunci: string;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  const { editMode, openEditor } = useInlineEdit();

  // Wrapper selalu dirender (mengemban kelas layout) agar tata letak tidak
  // berubah antara mode biasa & mode edit. Outline + pensil hanya saat edit.
  return (
    <div
      className={cn(
        'relative',
        className,
        editMode && 'rounded-xl outline-2 outline-dashed outline-primary/50 outline-offset-2',
      )}
    >
      {children}
      {editMode && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openEditor(kunci);
          }}
          className="absolute top-2 right-2 z-50 inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-primary/90"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit{label ? ` ${label}` : ''}
        </button>
      )}
    </div>
  );
}

/** Dialog editor satu blok konten (dipakai mode edit inline). */
function BlockEditorDialog({
  kunci,
  open,
  onOpenChange,
}: {
  kunci: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const block = getStaticBlock(kunci);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!block) return;
    setLoading(true);
    fetch(`/api/static-content?keys=${encodeURIComponent(kunci)}`)
      .then((r) => r.json())
      .then((j) => {
        const current = j.data?.items?.[kunci];
        setDraft(structuredClone(current ?? block.defaults));
      })
      .finally(() => setLoading(false));
  }, [kunci, block]);

  if (!block) return null;

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/static-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kunci, konten: draft }),
    });
    const j = await res.json();
    setSaving(false);
    if (j.error?.length) {
      toast.error(j.error[0]);
      return;
    }
    toast.success('Konten diperbarui');
    refreshStaticContent(); // segarkan tampilan tanpa reload
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{block.judul}</DialogTitle>
          <DialogDescription>{block.deskripsi}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            {block.fields.map((field) => (
              <FieldEditor
                key={field.name}
                field={field}
                value={draft[field.name]}
                onChange={(v) => setDraft((d) => ({ ...d, [field.name]: v }))}
              />
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            <X className="h-4 w-4 mr-1.5" /> Batal
          </Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
