import { getEnotifDb } from "../db";

export interface NotificationSettings {
  reminderDaysBeforeDue: number;
  secondReminderDaysBeforeDue: number;
  demandLetterGraceDays: number;
  demandLetterResponseDays: number;
  penaltyRatePercent: number;
}

const DEFAULTS: NotificationSettings = {
  reminderDaysBeforeDue: 10,
  secondReminderDaysBeforeDue: 3,
  demandLetterGraceDays: 0,
  demandLetterResponseDays: 15,
  penaltyRatePercent: 2,
};

/** Reads admin-configurable notification timing from Firestore, falling back to defaults. */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const db = getEnotifDb();
  const doc = await db.doc("settings/notifications").get();
  if (!doc.exists) return DEFAULTS;

  const data = doc.data() ?? {};
  return {
    reminderDaysBeforeDue: data.reminderDaysBeforeDue ?? DEFAULTS.reminderDaysBeforeDue,
    secondReminderDaysBeforeDue:
      data.secondReminderDaysBeforeDue ?? DEFAULTS.secondReminderDaysBeforeDue,
    demandLetterGraceDays: data.demandLetterGraceDays ?? DEFAULTS.demandLetterGraceDays,
    demandLetterResponseDays:
      data.demandLetterResponseDays ?? DEFAULTS.demandLetterResponseDays,
    penaltyRatePercent: data.penaltyRatePercent ?? DEFAULTS.penaltyRatePercent,
  };
}
