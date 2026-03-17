import Link from "next/link";
import { Role } from "@/lib/auth";

export function Sidebar({ role }: { role: Role }) {
  const links = role === "ADMIN" ? [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/listings", label: "Ä°lanlar" },
    { href: "/admin/consultants", label: "DanÄ±ÅŸmanlar" },
    { href: "/admin/finance", label: "Muhasebe" },
    { href: "/admin/reports", label: "Rapor" },
  ] : [
    { href: "/consultant/dashboard", label: "Dashboard" },
    { href: "/consultant/listings", label: "Ä°lanlar" },
    { href: "/consultant/finance", label: "Muhasebe" },
  ];

  return (
    <div className="w-64 bg-neutral-900 p-4">
      <ul>
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="block py-2 text-white hover:bg-neutral-800">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}