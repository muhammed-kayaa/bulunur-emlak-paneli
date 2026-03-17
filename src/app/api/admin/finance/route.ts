import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";

const MONTH_KEY_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.error }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const monthKey = searchParams.get("monthKey")?.trim();

  if (monthKey && !MONTH_KEY_REGEX.test(monthKey)) {
    return NextResponse.json({ ok: false, error: "Invalid monthKey. Expected YYYY-MM." }, { status: 400 });
  }

  const where: { monthKey?: string } = {};
  if (monthKey) {
    where.monthKey = monthKey;
  }

  const rows = await prisma.sale.findMany({
    where,
    orderBy: { soldAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, location: true } },
      consultant: { select: { id: true, name: true, email: true } },
    },
  });

  let salesCount = 0;
  let totalCommission = 0;
  let totalConsultantShare = 0;
  let totalAdminShare = 0;

  const formattedRows = rows.map((sale) => {
    const commissionAmount = sale.commissionAmount?.toString() ?? "0";
    const consultantShare = sale.consultantShare?.toString() ?? "0";
    const adminShare = sale.adminShare?.toString() ?? "0";

    salesCount += 1;
    totalCommission += Number(commissionAmount ?? 0);
    totalConsultantShare += Number(consultantShare ?? 0);
    totalAdminShare += Number(adminShare ?? 0);

    return {
      id: sale.id,
      listing: sale.listing,
      consultant: sale.consultant,
      monthKey: sale.monthKey,
      commissionAmount,
      commissionRateSnapshot: sale.commissionRateSnapshot,
      consultantShare,
      adminShare,
      soldAt: sale.soldAt,
      createdAt: sale.createdAt,
    };
  });

  return NextResponse.json({
    ok: true,
    data: {
      summary: {
        salesCount,
        totalCommission: totalCommission.toString(),
        totalConsultantShare: totalConsultantShare.toString(),
        totalAdminShare: totalAdminShare.toString(),
      },
      rows: formattedRows,
    },
  });
}
