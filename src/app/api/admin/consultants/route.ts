import { NextRequest, NextResponse } from "next/server";
import { getAll, updateCommissionRate, toggleActive, softDelete, createConsultant } from "@/lib/mock/consultantsStore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const q = searchParams.get("q") || "";

  const data = getAll({ status, q });
  return NextResponse.json({ ok: true, data });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, value } = body;

    if (!id || !action) {
      return NextResponse.json({ ok: false, error: "Missing id or action" }, { status: 400 });
    }

    let result;
    if (action === "rate") {
      if (typeof value !== "number") {
        return NextResponse.json({ ok: false, error: "Invalid value for rate" }, { status: 400 });
      }
      result = updateCommissionRate(id, value);
      if (!result) {
        return NextResponse.json({ ok: false, error: "Invalid rate or consultant not found" }, { status: 400 });
      }
    } else if (action === "toggle") {
      result = toggleActive(id);
      if (!result) {
        return NextResponse.json({ ok: false, error: "Consultant not found" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const success = softDelete(id);
    if (!success) {
      return NextResponse.json({ ok: false, error: "Consultant not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, photoUrl, commissionRate } = body;

    if (!name || !email || commissionRate === undefined) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const created = createConsultant({ name, email, photoUrl, commissionRate });
    if (!created) {
      return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: created });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
}