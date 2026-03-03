import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET(req: Request) {
  const guard = requireAdmin();
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: 403 });

  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "all";
  const auth = searchParams.get("auth") || "all";
  const portfolio = searchParams.get("portfolio") || "all";
  const deleted = searchParams.get("deleted") || "hide";

  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { location: { contains: q } },
    ];
  }

  if (status !== "all") where.status = status as Prisma.ListingStatus;
  if (auth !== "all") where.authorizationType = auth as Prisma.AuthorizationType;
  if (portfolio !== "all") where.portfolioType = portfolio as Prisma.PortfolioType;

  if (deleted === "hide") where.isDeleted = false;
  if (deleted === "showOnlyDeleted") where.isDeleted = true;
  // showAll => filtre yok

  const data = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { consultant: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: Request) {
  const guard = requireAdmin();
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: 403 });

  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  // soft delete
  await prisma.listing.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: "ADMIN",
    },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const guard = requireAdmin();
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const { id, authorizationType, status } = body;

  const updated = await prisma.listing.update({
    where: { id },
    data: {
      ...(authorizationType ? { authorizationType } : {}),
      ...(status ? { status } : {}),
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}