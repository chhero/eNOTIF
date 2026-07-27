import { NextRequest, NextResponse } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/session";
import { can, isWithinScope } from "@/lib/rbac";
import { handleApiError } from "@/lib/api-utils";
import { getLeaseById, updateLease, deleteLease } from "@/lib/data/leases";
import { verifyOfficeAssignment } from "@/lib/data/offices";
import { leaseInputSchema } from "@/lib/validation/lease";
import { writeAuditLog } from "@/lib/data/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const lease = await getLeaseById(id);
    if (!lease || !isWithinScope(user, lease)) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }
    return NextResponse.json({ lease });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const lease = await getLeaseById(id);
    if (!lease || !isWithinScope(user, lease)) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }
    if (!can(user.role, "leases:edit")) {
      throw new ForbiddenError("You are not allowed to edit this lease");
    }

    const body = await request.json();
    const input = leaseInputSchema.partial().parse(body);
    if (input.assignedPenro) {
      await verifyOfficeAssignment(input.assignedPenro, input.assignedCenro);
    }
    await updateLease(id, input);
    await writeAuditLog(user, "LEASE_UPDATED", `Updated FLA ${lease.flaNumber}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!can(user.role, "leases:delete")) {
      throw new ForbiddenError("You are not allowed to delete leases");
    }

    const { id } = await params;
    const lease = await getLeaseById(id);
    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    await deleteLease(id);
    await writeAuditLog(user, "LEASE_DELETED", `Deleted FLA ${lease.flaNumber}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
