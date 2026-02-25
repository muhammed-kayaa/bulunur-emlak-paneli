import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/shell/AppShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");
  return <AppShell role="ADMIN">{children}</AppShell>;
}