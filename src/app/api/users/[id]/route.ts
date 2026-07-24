import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, ForbiddenError } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { handleApiError } from "@/lib/api-utils";
import { setUserStatus } from "@/lib/data/users";
import { writeAuditLog } from "@/lib/data/audit";

const statusSchema = z.object({ status: z.enum(["active", "disabled"]) });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!can(user.role, "users:manage")) {
      throw new ForbiddenError("You are not allowed to manage users");
    }

    const { id } = await params;
    const { status } = statusSchema.parse(await request.json());

    await setUserStatus(id, status);
    await writeAuditLog(user, "USER_STATUS_CHANGED", `Set user ${id} status to ${status}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
