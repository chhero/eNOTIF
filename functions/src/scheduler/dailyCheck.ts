import * as logger from "firebase-functions/logger";
import { getEnotifDb } from "../db";
import type { LeaseDoc } from "../types";
import { TIMEZONE } from "../constants";
import { formatDateInTimezone, addDaysToDateString } from "../lib/dateUtils";
import { findRecipientsForLease } from "../data/users";
import { getNotificationSettings, type NotificationSettings } from "../data/settings";
import { sendAndLogNotification, wasNotifiedToday, wasEverNotified } from "../email/send";
import {
  tenDayReminderTemplate,
  tenDayLesseeReminderTemplate,
  threeDayReminderTemplate,
  demandLetterTemplate,
} from "../email/templates";
import { generateDemandLetterPdf, uploadDemandLetterPdf } from "../pdf/demandLetter";

function toTemplateData(lease: LeaseDoc) {
  return {
    applicantName: lease.applicantName,
    flaNumber: lease.flaNumber,
    amount: `PHP ${lease.annualRental.toLocaleString()}`,
    dueDate: lease.dueDate,
    office: lease.assignedPenro,
  };
}

async function fetchLeasesDueOn(db: FirebaseFirestore.Firestore, dueDate: string): Promise<LeaseDoc[]> {
  const snap = await db
    .collection("leases")
    .where("dueDate", "==", dueDate)
    .where("status", "in", ["ACTIVE", "FOR PAYMENT"])
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LeaseDoc);
}

/**
 * Runs the full daily scheduler described in the eNOTIF plan:
 *  1. N days before due (configurable) -> notify PENRO, CENRO, cashier, and lessee
 *  2. M days before due (configurable) -> notify lessee
 *  3. Due today           -> mark FOR PAYMENT if still unpaid
 *  4. Past due, unpaid, past the configured grace period -> mark OVERDUE, generate + send
 *                            demand letter, notify PENRO and cashier
 */
export async function runDailyScheduler(now: Date = new Date()): Promise<void> {
  const db = getEnotifDb();
  const today = formatDateInTimezone(now, TIMEZONE);
  const settings = await getNotificationSettings();

  await Promise.all([
    handleTenDayReminders(db, today, settings),
    handleThreeDayReminders(db, today, settings),
    handleDueToday(db, today),
    handleOverdue(db, today, settings),
  ]);
}

async function handleTenDayReminders(
  db: FirebaseFirestore.Firestore,
  today: string,
  settings: NotificationSettings
) {
  const targetDate = addDaysToDateString(today, settings.reminderDaysBeforeDue);
  const leases = await fetchLeasesDueOn(db, targetDate);

  for (const lease of leases) {
    if (await wasNotifiedToday(lease.id, "10_DAY_REMINDER", today)) continue;

    const templateData = toTemplateData(lease);
    const recipients = await findRecipientsForLease(lease.assignedPenro, lease.assignedCenro);
    const internalTemplate = tenDayReminderTemplate(templateData);

    for (const recipient of recipients) {
      await sendAndLogNotification({
        lease,
        recipient: recipient.email,
        notificationType: "10_DAY_REMINDER",
        subject: internalTemplate.subject,
        html: internalTemplate.html,
      });
    }

    const lesseeTemplate = tenDayLesseeReminderTemplate(templateData);
    await sendAndLogNotification({
      lease,
      recipient: lease.email,
      notificationType: "10_DAY_REMINDER",
      subject: lesseeTemplate.subject,
      html: lesseeTemplate.html,
    });

    logger.info(`10-day reminder sent for lease ${lease.flaNumber}`);
  }
}

async function handleThreeDayReminders(
  db: FirebaseFirestore.Firestore,
  today: string,
  settings: NotificationSettings
) {
  const targetDate = addDaysToDateString(today, settings.secondReminderDaysBeforeDue);
  const leases = await fetchLeasesDueOn(db, targetDate);

  for (const lease of leases) {
    if (await wasNotifiedToday(lease.id, "3_DAY_REMINDER", today)) continue;

    const template = threeDayReminderTemplate(toTemplateData(lease));
    await sendAndLogNotification({
      lease,
      recipient: lease.email,
      notificationType: "3_DAY_REMINDER",
      subject: template.subject,
      html: template.html,
    });

    logger.info(`3-day reminder sent for lease ${lease.flaNumber}`);
  }
}

async function handleDueToday(db: FirebaseFirestore.Firestore, today: string) {
  const leases = await fetchLeasesDueOn(db, today);

  for (const lease of leases) {
    if (lease.status === "FOR PAYMENT") continue;
    await db.collection("leases").doc(lease.id).update({
      status: "FOR PAYMENT",
      updatedAt: new Date().toISOString(),
    });
    logger.info(`Lease ${lease.flaNumber} marked FOR PAYMENT (due today)`);
  }
}

async function handleOverdue(
  db: FirebaseFirestore.Firestore,
  today: string,
  settings: NotificationSettings
) {
  // Include leases already marked OVERDUE (not just ACTIVE/FOR PAYMENT) so that
  // a lease whose demand letter previously failed to send (e.g. bad SMTP
  // credentials) keeps getting retried on every subsequent run instead of
  // being silently skipped forever once its status flips to OVERDUE.
  const snap = await db
    .collection("leases")
    .where("status", "in", ["ACTIVE", "FOR PAYMENT", "OVERDUE"])
    .where("dueDate", "<", today)
    .get();

  const leases = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LeaseDoc);

  for (const lease of leases) {
    if (lease.status !== "OVERDUE") {
      await db.collection("leases").doc(lease.id).update({
        status: "OVERDUE",
        updatedAt: new Date().toISOString(),
      });
    }

    // Respect the configured grace period before generating the demand letter.
    const demandLetterDate = addDaysToDateString(lease.dueDate, settings.demandLetterGraceDays);
    if (today < demandLetterDate) continue;

    // Skip only if a demand letter was ever SUCCESSFULLY sent for this lease —
    // a same-day-only check would let a permanently-failed send go unretried
    // once the lease is excluded from the ACTIVE/FOR PAYMENT query above.
    if (await wasEverNotified(lease.id, "DEMAND_LETTER")) continue;

    const penalty = Math.round(lease.annualRental * (settings.penaltyRatePercent / 100));
    const pdfBuffer = await generateDemandLetterPdf(lease, penalty, settings.demandLetterResponseDays);
    const pdfUrl = await uploadDemandLetterPdf(lease.id, pdfBuffer);

    const template = demandLetterTemplate({
      ...toTemplateData(lease),
      penalty: `PHP ${penalty.toLocaleString()}`,
      currentDate: new Date().toLocaleDateString("en-PH"),
    });

    const sentOk = await sendAndLogNotification({
      lease,
      recipient: lease.email,
      notificationType: "DEMAND_LETTER",
      subject: template.subject,
      html: template.html,
      attachments: [{ filename: `Demand-Letter-${lease.flaNumber}.pdf`, content: pdfBuffer }],
      pdfUrl,
    });

    await db.collection("demand_letters").add({
      leaseId: lease.id,
      flaNumber: lease.flaNumber,
      province: lease.assignedPenro,
      cenro: lease.assignedCenro,
      generatedDate: new Date().toISOString(),
      pdfUrl,
      emailStatus: sentOk ? "SENT" : "FAILED",
    });

    const recipients = await findRecipientsForLease(lease.assignedPenro, lease.assignedCenro);
    for (const recipient of recipients) {
      await sendAndLogNotification({
        lease,
        recipient: recipient.email,
        notificationType: "DEMAND_LETTER",
        subject: `[Overdue] FLA ${lease.flaNumber} demand letter sent to lessee`,
        html: template.html,
        pdfUrl,
      });
    }

    logger.info(`Lease ${lease.flaNumber} marked OVERDUE, demand letter generated`);
  }
}
