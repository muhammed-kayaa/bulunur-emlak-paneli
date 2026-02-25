"use client";

import { Role } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function Topbar({ role }: { role: Role }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/login");
  };

  return (
    <div className="bg-neutral-900 p-4 flex justify-between items-center">
      <span className="bg-neutral-700 px-2 py-1 rounded text-sm">{role}</span>
      <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700">
        Logout
      </button>
    </div>
  );
}