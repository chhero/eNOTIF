import { NextRequest, NextResponse } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { handleApiError } from "@/lib/api-utils";
import {
  listPENROs,
  getPENROById,
  createPENRO,
  updatePENRO,
  deletePENRO,
} from "@/lib/data/offices";
import { z } from "zod";

const penroSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  province: z.string().min(1, "Province is required"),
  region: z.string().min(1, "Region is required"),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  email: z.string().email("Invalid email"),
});

export async function GET() {
  try {
    const user = await requireUser();
    if (!can(user.role, "penro:manage") && !can(user.role, "users:view")) {
      throw new ForbiddenError("You are not allowed to view PENROs");
    }

    const penros = await listPENROs();
    return NextResponse.json({ penros });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "penro:manage")) {
      throw new ForbiddenError("You are not allowed to create PENROs");
    }

    const body = await request.json();
    const input = penroSchema.parse(body);

    const penro = await createPENRO(input, user);
    return NextResponse.json({ penro }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "penro:manage")) {
      throw new ForbiddenError("You are not allowed to update PENROs");
    }

    const body = await request.json();
    const { id, ...input } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updates = penroSchema.partial().parse(input);
    const penro = await updatePENRO(id, updates, user);

    return NextResponse.json({ penro });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "penro:manage")) {
      throw new ForbiddenError("You are not allowed to delete PENROs");
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await deletePENRO(id, user);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
