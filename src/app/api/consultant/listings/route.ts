import { NextRequest, NextResponse } from "next/server";
import { getByConsultantId, createListing, updateAuthorizationType, softDelete } from "@/lib/mock/listingsStore";

async function getConsultantId(): Promise<string> {
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  const resolvedCookies = cookieStore instanceof Promise ? await cookieStore : cookieStore;
  const userId = resolvedCookies.get("userId")?.value;
  return userId || "1"; // fallback to "1"
}

export async function GET(request: NextRequest) {
  try {
    const consultantId = await getConsultantId();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q") || undefined;
    const statusParam = searchParams.get("status");
    const status = statusParam === "all" || statusParam === "ACTIVE" || statusParam === "SOLD" ? statusParam : "all";
    const authParam = searchParams.get("auth");
    const auth = authParam === "all" || authParam === "YETKILI" || authParam === "YETKISIZ" ? authParam : "all";
    const portfolioParam = searchParams.get("portfolio");
    const portfolio = portfolioParam === "all" || portfolioParam === "SATILIK" || portfolioParam === "KIRALIK" ? portfolioParam : "all";
    const deletedParam = searchParams.get("deleted");
    const deleted = deletedParam === "hide" || deletedParam === "showOnlyDeleted" || deletedParam === "showAll" ? deletedParam : "hide";

    const listings = getByConsultantId(consultantId, { q, status, auth, portfolio, deleted });

    return NextResponse.json({ ok: true, data: listings });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const consultantId = await getConsultantId();
    const body = await request.json();

    const { title, portfolioType, propertyType, price, rooms, sqm, location, authorizationType } = body;

    if (!title || !portfolioType || !propertyType || typeof price !== 'number' || !location?.city || !location?.district || !authorizationType) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const newListing = createListing({
      title,
      portfolioType,
      propertyType,
      price,
      rooms,
      sqm,
      location,
      authorizationType,
      consultantId,
    });

    return NextResponse.json({ ok: true, data: newListing });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to create listing" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const consultantId = await getConsultantId();
    const body = await request.json();
    const { id, authorizationType } = body;

    if (!id || !authorizationType) {
      return NextResponse.json({ ok: false, error: "Missing id or authorizationType" }, { status: 400 });
    }

    // Check if listing belongs to consultant and not deleted
    const listings = getByConsultantId(consultantId, { deleted: "showAll" });
    const listing = listings.find(l => l.id === id);
    if (!listing || listing.isDeleted) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const success = updateAuthorizationType(id, authorizationType);
    if (!success) {
      return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const consultantId = await getConsultantId();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    // Check if listing belongs to consultant
    const listings = getByConsultantId(consultantId, { deleted: "showAll" });
    const listing = listings.find(l => l.id === id);
    if (!listing) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const success = softDelete(id, { role: "CONSULTANT", id: consultantId });
    if (!success) {
      return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to delete listing" }, { status: 500 });
  }
}