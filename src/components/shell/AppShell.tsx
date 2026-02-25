import { Role } from "@/lib/auth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col">
        <Topbar role={role} />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}