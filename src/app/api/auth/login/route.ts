import { NextResponse } from "next/server";

type Role = "ADMIN" | "CONSULTANT";

function resolveRole(email: string): Role | null {
  if (email.includes("admin")) return "ADMIN";
  if (email.includes("consultant")) return "CONSULTANT";
  return null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.toLowerCase?.();

  if (!email) {
    return NextResponse.json({ ok: false, error: "EMAIL_REQUIRED" }, { status: 400 });
  }

  const role = resolveRole(email);
  if (!role) {
    return NextResponse.json({ ok: false, error: "ROLE_NOT_FOUND" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role });

  res.cookies.set("role", role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}