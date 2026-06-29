import { ok } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return ok({ user: null });
  return ok({
    user: {
      id: session.uid,
      user_id: session.userId,
      name: session.nama,
      level: session.level,
    },
  });
}
