"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Decimal } from "@prisma/client/runtime/library";

type MarkListingSoldInput = {
  listingId: string;
  commissionAmount: number;
};

type MarkListingSoldResponse =
  | { success: true; data: any }
  | { success: false; error: string };

async function getCurrentConsultantId(): Promise<string | null> {
  const store = await cookies();
  return store.get("consultantId")?.value ?? null;
}

export async function markListingSold(
  input: MarkListingSoldInput
): Promise<MarkListingSoldResponse> {
  try {
    const consultantId = await getCurrentConsultantId(); // âœ… await
    if (!consultantId) return { success: false, error: "Unauthorized: consultantId cookie not found" };

    const listingId = (input.listingId ?? "").trim();
    const commissionAmount = Number(input.commissionAmount);

    if (!listingId) return { success: false, error: "Invalid input: listingId is required" };
    if (!Number.isFinite(commissionAmount) || commissionAmount <= 0) {
      return { success: false, error: "Invalid input: commissionAmount must be > 0" };
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const consultant = await tx.consultant.findUnique({
        where: { id: consultantId },
        select: { id: true, isActive: true, commissionRate: true },
      });
      if (!consultant) throw new Error("Consultant not found");
      if (!consultant.isActive) throw new Error("Inactive consultant cannot sell listings");

      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: { id: true, status: true, isDeleted: true, consultantId: true },
      });
      if (!listing) throw new Error("Listing not found");
      if (listing.isDeleted) throw new Error("Cannot sell a deleted listing");
      if (listing.status !== "ACTIVE") throw new Error("Listing must be ACTIVE to sell");
      if (listing.consultantId !== consultantId) throw new Error("You can only sell your own listing");

      const existingSale = await tx.sale.findUnique({ where: { listingId }, select: { id: true } });
      if (existingSale) throw new Error("This listing has already been sold");

      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const commission = new Decimal(commissionAmount);
      const rate = consultant.commissionRate;

      const consultantShare = commission.times(rate).div(100).toDecimalPlaces(2);
      const adminShare = commission.minus(consultantShare).toDecimalPlaces(2);

      const updatedListing = await tx.listing.update({
        where: { id: listingId },
        data: { status: "SOLD", soldAt: now },
      });

      await tx.sale.create({
        data: {
          listingId,
          consultantId,
          monthKey,
          commissionAmount: commission,
          commissionRateSnapshot: rate,
          consultantShare,
          adminShare,
          soldAt: now,
        },
      });

      await tx.auditLog.create({
        data: {
          actionType: "LISTING_SOLD",
          actorRole: "CONSULTANT",
          actorId: consultantId,
          targetType: "LISTING",
          targetId: listingId,
        },
      });

      return updatedListing;
    });

    return { success: true, data: result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "An error occurred";
    return { success: false, error: msg };
  }
}