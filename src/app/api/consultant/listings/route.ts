import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { markListingSold } from "@/lib/actions/listings";

async function getConsultantIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get("consultantId")?.value ?? null; // senin cookie adın buysa
}

export async function GET(req: NextRequest) {
  try {
    const consultantId = await getConsultantIdFromCookies();
    if (!consultantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized: consultantId cookie not found" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") ?? "").trim();
    const status = (searchParams.get("status") ?? "all") as "all" | "ACTIVE" | "SOLD";
    const auth = (searchParams.get("auth") ?? "all") as "all" | "YETKILI" | "YETKISIZ";
    const portfolio = (searchParams.get("portfolio") ?? "all") as "all" | "SATILIK" | "KIRALIK";
    const deleted = (searchParams.get("deleted") ?? "hide") as "hide" | "showOnlyDeleted" | "showAll";

    const where: Prisma.ListingWhereInput = {
      consultantId,
    };

    // q => OR array (undefined yok)
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { location: { contains: q } },
      ];
    }

    if (status !== "all") where.status = status;
    if (auth !== "all") where.authorizationType = auth;
    if (portfolio !== "all") where.portfolioType = portfolio;

    if (deleted === "hide") where.isDeleted = false;
    if (deleted === "showOnlyDeleted") where.isDeleted = true;
    // showAll => filtre yok

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, data: listings });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const consultantId = await getConsultantIdFromCookies();
    if (!consultantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized: consultantId cookie not found" }, { status: 401 });
    }

    const body = await req.json();

    const created = await prisma.listing.create({
      data: {
        title: String(body.title ?? "").trim(),
        portfolioType: body.portfolioType,
        propertyType: String(body.propertyType ?? ""),
        price: body.price, // schema’da Decimal/Float neyse prisma handle eder
        rooms: body.rooms ?? null,
        sqm: body.sqm ?? null,
        location: `${body.location?.city ?? ""} ${body.location?.district ?? ""} ${body.location?.neighborhood ?? ""}`.trim(),
        description: body.description ?? null,
        photos: body.photos ?? null,
        consultantId,
        authorizationType: body.authorizationType,
        status: "ACTIVE",
        isDeleted: false,
      },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const consultantId = await getConsultantIdFromCookies();
    if (!consultantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized: consultantId cookie not found" }, { status: 401 });
    }

    const body = await req.json();
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    // sadece kendi ilanını güncelleyebilsin
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.consultantId !== consultantId) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        authorizationType: body.authorizationType ?? undefined,
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const consultantId = await getConsultantIdFromCookies();
    if (!consultantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized: consultantId cookie not found" }, { status: 401 });
    }

    const body = await req.json();
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.consultantId !== consultantId) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy: consultantId },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const consultantId = await getConsultantIdFromCookies();
    if (!consultantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized: consultantId cookie not found" }, { status: 401 });
    }

    const body = await req.json();
    const listingId = String(body.listingId ?? "").trim();
    const commissionAmount = Number(body.commissionAmount);

    if (!listingId) {
      return NextResponse.json({ ok: false, error: "listingId is required" }, { status: 400 });
    }
    if (!Number.isFinite(commissionAmount) || commissionAmount <= 0) {
      return NextResponse.json({ ok: false, error: "commissionAmount must be a positive number" }, { status: 400 });
    }

    const result = await markListingSold({ listingId, commissionAmount });

    if (result.success) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}