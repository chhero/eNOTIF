import { NextRequest, NextResponse } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { handleApiError } from "@/lib/api-utils";
import {
  listCENROs,
  listCENROsByPENRO,
  createCENRO,
  updateCENRO,
  deleteCENRO,
} from "@/lib/data/offices";
import { z } from "zod";

const cenroSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  province: z.string().min(1, "Province is required"),
  region: z.string().min(1, "Region is required"),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  email: z.string().email("Invalid email"),
  penroId: z.string().min(1, "PENRO is required"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "cenro:manage") && !can(user.role, "users:view")) {
      throw new ForbiddenError("You are not allowed to view CENROs");
    }

    const { searchParams } = new URL(request.url);
    const penroId = searchParams.get("penroId");

    const cenros = penroId
      ? await listCENROsByPENRO(penroId)
      : await listCENROs();

    return NextResponse.json({ cenros });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "cenro:manage")) {
      throw new ForbiddenError("You are not allowed to create CENROs");
    }

    const body = await request.json();
    const input = cenroSchema.parse(body);

    const cenro = await createCENRO(input, user);
    return NextResponse.json({ cenro }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "cenro:manage")) {
      throw new ForbiddenError("You are not allowed to update CENROs");
    }

    const body = await request.json();
    const { id, ...input } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updates = cenroSchema.partial().parse(input);
    const cenro = await updateCENRO(id, updates, user);

    return NextResponse.json({ cenro });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "cenro:manage")) {
      throw new ForbiddenError("You are not allowed to delete CENROs");
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await deleteCENRO(id, user);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
