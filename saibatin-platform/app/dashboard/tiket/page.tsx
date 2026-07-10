import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TiketPanel } from "@/components/tiket/tiket-panel";

export const dynamic = "force-dynamic";

/** Kotak masuk tiket untuk petugas (admin/operator/OPD). */
export default async function DashboardTiketPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.level === 3) redirect("/tiket");

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tiket & Chat</h1>
        <p className="text-sm text-slate-500 mt-1">
          Balas tiket warga dan berkomunikasi antar petugas (kategori Internal).
        </p>
      </div>
      <TiketPanel petugas />
    </div>
  );
}
