import { toast } from "sonner";

/**
 * Toast seragam untuk seluruh aplikasi. Satu pesan → toast biasa;
 * banyak pesan → judul + daftar poin (dirapikan: dedup, maksimal 6 poin).
 */
const MAX_ITEMS = 6;

function dedup(messages: string[] | string): string[] {
  const arr = Array.isArray(messages) ? messages : [messages];
  return [...new Set(arr.map((m) => String(m).trim()).filter(Boolean))];
}

function listDescription(items: string[]) {
  const shown = items.slice(0, MAX_ITEMS);
  const rest = items.length - shown.length;
  return (
    <ul className="list-disc pl-4 space-y-0.5">
      {shown.map((m) => (
        <li key={m}>{m}</li>
      ))}
      {rest > 0 && <li>dan {rest} hal lainnya</li>}
    </ul>
  );
}

export function notifyError(
  messages: string[] | string,
  title = "Periksa kembali data Anda",
) {
  const items = dedup(messages);
  if (items.length === 0) return;
  if (items.length === 1) {
    toast.error(items[0]);
    return;
  }
  toast.error(title, { description: listDescription(items) });
}

export function notifySuccess(messages: string[] | string, title?: string) {
  const items = dedup(messages);
  if (items.length === 0) return;
  if (items.length === 1 && !title) {
    toast.success(items[0]);
    return;
  }
  toast.success(title ?? items[0], {
    description: items.length > 1 ? listDescription(items.slice(title ? 0 : 1)) : undefined,
  });
}

export function notifyInfo(message: string, description?: string) {
  toast.info(message, description ? { description } : undefined);
}
