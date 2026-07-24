import { NextRequest, NextResponse } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { handleApiError } from "@/lib/api-utils";
import { listLeasesForUser, createLease } from "@/lib/data/leases";
import { leaseInputSchema } from "@/lib/validation/lease";
import { writeAuditLog } from "@/lib/data/audit";

export async function GET() {
  try {
    const user = await requireUser();
    const leases = await listLeasesForUser(user);
    return NextResponse.json({ leases });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "leases:create")) {
      throw new ForbiddenError("You are not allowed to register leases");
    }

    const body = await request.json();
    const input = leaseInputSchema.parse(body);

    const lease = await createLease(input, user.uid);
    await writeAuditLog(user, "LEASE_CREATED", `Registered FLA ${lease.flaNumber}`);

    return NextResponse.json({ lease }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
