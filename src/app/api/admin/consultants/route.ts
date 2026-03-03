import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  const guard = requireAdmin();
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: 403 });

  const data = await prisma.consultant.findMany({
    orderBy: { createdAt: "desc" as any }, // sqlite'da createdAt yoksa kaldır
    select: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      commissionRate: true,
      isActive: true,
      _count: { select: { listings: true, sales: true } },
    },
  });

  return NextResponse.json({ ok: true, data });
}

export async function PATCH(req: Request) {
  const guard = requireAdmin();
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const { id, commissionRate, isActive, name, email, photoUrl } = body;

  const updated = await prisma.consultant.update({
    where: { id },
    data: {
      ...(typeof commissionRate === "number" ? { commissionRate } : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(typeof name === "string" ? { name } : {}),
      ...(typeof email === "string" ? { email } : {}),
      ...(photoUrl === null || typeof photoUrl === "string" ? { photoUrl } : {}),
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}