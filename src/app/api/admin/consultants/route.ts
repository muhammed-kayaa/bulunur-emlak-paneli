import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error });
  }

  const consultants = await prisma.consultant.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      commissionRate: true,
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json({ ok: true, data: consultants });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error });
  }

  const body = await request.json();
  const { id, isActive, commissionRate } = body;

  if (!id) {
    return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  }

  if (commissionRate !== undefined && (commissionRate < 0 || commissionRate > 100)) {
    return NextResponse.json({ ok: false, error: "commissionRate must be between 0 and 100" }, { status: 400 });
  }

  // Fetch current consultant
  const currentConsultant = await prisma.consultant.findUnique({
    where: { id },
    select: { isActive: true, commissionRate: true },
  });

  if (!currentConsultant) {
    return NextResponse.json({ ok: false, error: "Consultant not found" }, { status: 404 });
  }

  // Prepare update data
  const updateData: any = {};
  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }
  if (commissionRate !== undefined) {
    updateData.commissionRate = commissionRate;
  }

  // Update
  const updatedConsultant = await prisma.consultant.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      commissionRate: true,
      isActive: true,
    },
  });

  // Audit logs
  if (isActive !== undefined && isActive === false && currentConsultant.isActive === true) {
    await prisma.auditLog.create({
      data: {
        actionType: "CONSULTANT_DEACTIVATED",
        actorRole: "ADMIN",
        actorId: null,
        targetType: "CONSULTANT",
        targetId: id,
        createdAt: new Date(),
      },
    });
  }

  if (commissionRate !== undefined && commissionRate !== currentConsultant.commissionRate) {
    await prisma.auditLog.create({
      data: {
        actionType: "COMMISSION_RATE_CHANGED",
        actorRole: "ADMIN",
        actorId: null,
        targetType: "CONSULTANT",
        targetId: id,
        createdAt: new Date(),
      },
    });
  }

  return NextResponse.json({ ok: true, data: updatedConsultant });
}