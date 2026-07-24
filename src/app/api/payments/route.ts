import { NextRequest, NextResponse } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/session";
import { can, isWithinScope } from "@/lib/rbac";
import { handleApiError } from "@/lib/api-utils";
import { listPaymentsForUser, recordPayment } from "@/lib/data/payments";
import { paymentInputSchema } from "@/lib/validation/payment";
import { getLeaseById } from "@/lib/data/leases";

export async function GET() {
  try {
    const user = await requireUser();
    const payments = await listPaymentsForUser(user);
    return NextResponse.json({ payments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "payments:record")) {
      throw new ForbiddenError("You are not allowed to record payments");
    }

    const body = await request.json();
    const input = paymentInputSchema.parse(body);

    const lease = await getLeaseById(input.leaseId);
    if (!lease || !isWithinScope(user, lease)) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    const payment = await recordPayment(input, user);
    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
