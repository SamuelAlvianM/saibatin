import { ok } from "@/lib/api-response";
import { destroySession } from "@/lib/auth";

export async function POST() {
  await destroySession();
  return ok(null, ["Info: Berhasil logout"]);
}
