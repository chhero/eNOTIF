import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, ForbiddenError } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { handleApiError } from "@/lib/api-utils";
import { getNotificationSettings, updateNotificationSettings } from "@/lib/data/settings";

const settingsSchema = z.object({
  reminderDaysBeforeDue: z.number().int().min(1).max(90),
  secondReminderDaysBeforeDue: z.number().int().min(1).max(90),
  demandLetterGraceDays: z.number().int().min(0).max(90),
  demandLetterResponseDays: z.number().int().min(1).max(90),
  penaltyRatePercent: z.number().min(0).max(100),
});

export async function GET() {
  try {
    await requireUser();
    const settings = await getNotificationSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user.role, "system:configure")) {
      throw new ForbiddenError("You are not allowed to change system settings");
    }

    const body = await request.json();
    const input = settingsSchema.parse(body);
    const settings = await updateNotificationSettings(input, user);

    return NextResponse.json({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}
