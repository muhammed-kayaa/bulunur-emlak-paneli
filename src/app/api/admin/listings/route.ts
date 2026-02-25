import { NextRequest, NextResponse } from "next/server";
import { getAll } from "@/lib/mock/listingsStore";

export async function GET(request: NextRequest) {
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

  const listings = getAll({ q, status, auth, portfolio, deleted });

  return NextResponse.json({ ok: true, data: listings });
}