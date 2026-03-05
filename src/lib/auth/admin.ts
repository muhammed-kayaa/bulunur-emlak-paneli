import { cookies } from "next/headers";

export async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const store = await cookies();

  const role = store.get("role")?.value; // ADMIN bekliyoruz
  if (role !== "ADMIN") return { ok: false, error: "Forbidden" };

  return { ok: true };
}