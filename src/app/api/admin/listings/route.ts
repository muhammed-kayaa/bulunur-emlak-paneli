import { NextResponse } from "next/server";
import type { Prisma, ListingStatus, AuthorizationType, PortfolioType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";

function isListingStatus(v: unknown): v is ListingStatus {
  return v === "ACTIVE" || v === "SOLD";
}
function isAuthorizationType(v: unknown): v is AuthorizationType {
  return v === "YETKILI" || v === "YETKISIZ";
}
function isPortfolioType(v: unknown): v is PortfolioType {
  return v === "SATILIK" || v === "KIRALIK";
}

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.error }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim() ?? "";
  const statusParam = searchParams.get("status") ?? "all";
  const authParam = searchParams.get("auth") ?? "all";
  const portfolioParam = searchParams.get("portfolio") ?? "all";
  const deleted = searchParams.get("deleted") ?? "hide";

  const where: Prisma.ListingWhereInput = {};

  if (q) {
     where.OR = [
       { title: { contains: q } },
       { location: { contains: q } },
];
  }

  if (statusParam !== "all") {
    if (!isListingStatus(statusParam)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    where.status = statusParam;
  }

  if (authParam !== "all") {
    if (!isAuthorizationType(authParam)) {
      return NextResponse.json({ ok: false, error: "Invalid authorizationType" }, { status: 400 });
    }
    where.authorizationType = authParam;
  }

  if (portfolioParam !== "all") {
    if (!isPortfolioType(portfolioParam)) {
      return NextResponse.json({ ok: false, error: "Invalid portfolioType" }, { status: 400 });
    }
    where.portfolioType = portfolioParam;
  }

  if (deleted === "hide") where.isDeleted = false;
  else if (deleted === "showOnlyDeleted") where.isDeleted = true;
  else if (deleted !== "showAll") {
    return NextResponse.json({ ok: false, error: "Invalid deleted filter" }, { status: 400 });
  }

  const data = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { consultant: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.error }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;

  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  try {
    await prisma.listing.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: "ADMIN",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
  }
}

export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.error }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;

  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  const authorizationType = body?.authorizationType as unknown;
  const status = body?.status as unknown;

  if (authorizationType === undefined && status === undefined) {
    return NextResponse.json({ ok: false, error: "At least one field (authorizationType or status) is required" }, { status: 400 });
  }

  const data: Prisma.ListingUpdateInput = {};

  if (authorizationType !== undefined) {
    if (!isAuthorizationType(authorizationType)) {
      return NextResponse.json({ ok: false, error: "Invalid authorizationType" }, { status: 400 });
    }
    data.authorizationType = authorizationType;
  }

  if (status !== undefined) {
    if (!isListingStatus(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    data.status = status;
  }

  try {
    const updated = await prisma.listing.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
  }
}