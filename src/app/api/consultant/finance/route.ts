import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getConsultantIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get("consultantId")?.value ?? null; // sende cookie adı buysa
}

export async function GET(req: NextRequest) {
  try {
    const consultantId = await getConsultantIdFromCookies();
    if (!consultantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthKey = (searchParams.get("monthKey") ?? "").trim(); // opsiyonel filtre

    const where = {
      consultantId,
      ...(monthKey ? { monthKey } : {}),
    };

    const sales = await prisma.sale.findMany({
      where,
      orderBy: [{ soldAt: "desc" }],
      include: {
        listing: { select: { id: true, title: true, location: true } },
      },
    });

    // SQLite + Decimal -> clientte rahat kullanmak için string döndürmek mantıklı
    const serialized = sales.map((s) => ({
      id: s.id,
      monthKey: s.monthKey,
      soldAt: s.soldAt,
      createdAt: s.createdAt,
      commissionRateSnapshot: s.commissionRateSnapshot,
      commissionAmount: s.commissionAmount.toString(),
      consultantShare: s.consultantShare.toString(),
      adminShare: s.adminShare.toString(),
      listing: s.listing,
    }));

    // Aylık özet (monthKey bazında)
    const summaryMap = new Map<string, { monthKey: string; count: number; totalCommission: number; consultantTotal: number; adminTotal: number }>();

    for (const s of serialized) {
      const key = s.monthKey;
      const comm = Number(s.commissionAmount);
      const cons = Number(s.consultantShare);
      const adm = Number(s.adminShare);

      const cur = summaryMap.get(key) ?? { monthKey: key, count: 0, totalCommission: 0, consultantTotal: 0, adminTotal: 0 };
      cur.count += 1;
      cur.totalCommission += comm;
      cur.consultantTotal += cons;
      cur.adminTotal += adm;
      summaryMap.set(key, cur);
    }

    const monthlySummary = Array.from(summaryMap.values()).sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));

    // when a monthKey filter is provided we only care about that single bucket,
    // otherwise fall back to aggregating everything. the frontend expects a
    // "summary" object instead of an array, so compute it here.
    let summary: { count: number; totalCommission: number; consultantTotal: number; adminTotal: number };

    if (monthKey) {
      // we filtered sales by monthKey earlier, so monthlySummary will have at
      // most one entry (matching the provided key)
      summary = monthlySummary[0] ?? { count: 0, totalCommission: 0, consultantTotal: 0, adminTotal: 0 };
    } else {
      // aggregate over all sales
      summary = serialized.reduce(
        (acc, cur) => {
          acc.count += 1;
          acc.totalCommission += Number(cur.commissionAmount);
          acc.consultantTotal += Number(cur.consultantShare);
          acc.adminTotal += Number(cur.adminShare);
          return acc;
        },
        { count: 0, totalCommission: 0, consultantTotal: 0, adminTotal: 0 }
      );
    }

    return NextResponse.json({ ok: true, data: { sales: serialized, summary } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}