import { ok } from "@/lib/api-response";
import { cekJamLayanan } from "@/lib/jam-layanan";
import { loadJamLayanan } from "@/lib/jam-layanan-server";

export const dynamic = "force-dynamic";

/** Status jam layanan untuk halaman publik: sedang buka atau tidak + pesan. */
export async function GET() {
  const cfg = await loadJamLayanan();
  const status = cekJamLayanan(cfg);
  return ok({
    enabled: cfg.enabled,
    open: status.open,
    message: status.message,
    days: cfg.days,
    holidays: cfg.holidays,
  });
}
