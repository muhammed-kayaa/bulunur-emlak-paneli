export type Role = "ADMIN" | "CONSULTANT";

async function getCookieStore() {
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  if (cookieStore instanceof Promise) {
    return await cookieStore;
  }
  return cookieStore;
}

export async function requireRole(required: Role): Promise<Role> {
  const { redirect } = await import("next/navigation");
  const cookieStore = await getCookieStore();
  const role = cookieStore.get("role")?.value;
  if (!role || role !== required) {
    redirect("/login");
  }
  return role as Role;
}