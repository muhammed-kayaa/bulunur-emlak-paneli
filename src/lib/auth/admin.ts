import { cookies } from "next/headers";

export function requireAdmin() {
  const store = cookies(); // await YOK
  const role = store.get("role")?.value;

  if (role !== "ADMIN") return { ok: false, error: "Forbidden" };
  return { ok: true };
}