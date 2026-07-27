import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import type { NotificationSettingsDoc, SessionUser } from "@/types";
import { writeAuditLog } from "@/lib/data/audit";

const DOC_PATH = "settings/notifications";

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsDoc = {
  reminderDaysBeforeDue: 10,
  secondReminderDaysBeforeDue: 3,
  demandLetterGraceDays: 0,
  demandLetterResponseDays: 15,
  penaltyRatePercent: 2,
  updatedAt: new Date(0).toISOString(),
};

export async function getNotificationSettings(): Promise<NotificationSettingsDoc> {
  const doc = await adminDb.doc(DOC_PATH).get();
  if (!doc.exists) return DEFAULT_NOTIFICATION_SETTINGS;
  return { ...DEFAULT_NOTIFICATION_SETTINGS, ...doc.data() } as NotificationSettingsDoc;
}

export async function updateNotificationSettings(
  input: Partial<Omit<NotificationSettingsDoc, "updatedAt">>,
  user: SessionUser
): Promise<NotificationSettingsDoc> {
  const current = await getNotificationSettings();
  const data: NotificationSettingsDoc = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  await adminDb.doc(DOC_PATH).set(data, { merge: true });

  await writeAuditLog(
    user,
    "SETTINGS_UPDATED",
    "Updated notification timing settings (reminder days / demand letter timing / penalty rate)"
  );

  return data;
}
