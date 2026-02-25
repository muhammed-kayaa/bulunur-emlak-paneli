import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/shell/AppShell";

export const dynamic = "force-dynamic";

export default async function ConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("CONSULTANT");
  return <AppShell role="CONSULTANT">{children}</AppShell>;
}