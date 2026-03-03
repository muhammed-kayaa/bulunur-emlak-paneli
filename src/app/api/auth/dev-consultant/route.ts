import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const consultant = await prisma.consultant.findFirst();

  if (!consultant) {
    return NextResponse.json(
      { ok: false, error: "No consultant found in DB" },
      { status: 404 }
    );
  }

  const res = NextResponse.json({ ok: true, consultantId: consultant.id });

  res.cookies.set("role", "CONSULTANT", { httpOnly: true, path: "/" });
  res.cookies.set("consultantId", consultant.id, { httpOnly: true, path: "/" });

  return res;
}