import { NextRequest, NextResponse } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { handleApiError } from "@/lib/api-utils";
import { listUsers, createUser } from "@/lib/data/users";
import { userInputSchema } from "@/lib/validation/user";
import { writeAuditLog } from "@/lib/data/audit";

export async function GET() {
  try {
    const user = await requireUser();
    if (!can(user.role, "users:manage")) {
      throw new ForbiddenError("You are not allowed to view users");
    }
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "users:manage")) {
      throw new ForbiddenError("You are not allowed to manage users");
    }

    const body = await request.json();
    const input = userInputSchema.parse(body);

    const created = await createUser(input);
    await writeAuditLog(user, "USER_CREATED", `Created user ${created.email} (${created.role})`);

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
