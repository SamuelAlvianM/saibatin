import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Footer } from "@/components/shared/footer";
import { TiketPanel } from "@/components/tiket/tiket-panel";
import { Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

/** Tiket bantuan warga: buka tiket, chat dengan petugas, tutup/buka kembali. */
export default async function TiketPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <div
        className="relative py-14 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1b4b72 0%, #2176bd 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl glass-card-blue flex items-center justify-center">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Tiket Bantuan</h1>
              <p className="text-primary-foreground/80 mt-1">
                Tanya petugas Disdukcapil lewat tiket — balasan masuk ke halaman ini
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-10">
        <TiketPanel petugas={session.level !== 3} />
      </div>

      <Footer />
    </div>
  );
}
