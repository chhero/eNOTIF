import * as logger from "firebase-functions/logger";
import { getEnotifDb } from "../db";
import type { LeaseDoc } from "../types";
import {
  REMINDER_DAYS_BEFORE_DUE,
  DEMAND_LETTER_REMINDER_DAYS_BEFORE_DUE,
  TIMEZONE,
} from "../constants";
import { formatDateInTimezone, addDaysToDateString } from "../lib/dateUtils";
import { findRecipientsForLease } from "../data/users";
import { sendAndLogNotification, wasNotifiedToday } from "../email/send";
import {
  tenDayReminderTemplate,
  tenDayLesseeReminderTemplate,
  threeDayReminderTemplate,
  demandLetterTemplate,
} from "../email/templates";
import { generateDemandLetterPdf, uploadDemandLetterPdf } from "../pdf/demandLetter";

const PENALTY_RATE = 0.02; // 2% surcharge on overdue annual rental (adjust per DENR policy)

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
 *  1. 10 days before due  -> notify PENRO, CENRO, cashier, and lessee
 *  2. 3 days before due   -> notify lessee
 *  3. Due today           -> mark FOR PAYMENT if still unpaid
 *  4. Past due, unpaid    -> mark OVERDUE, generate + send demand letter,
 *                            notify PENRO and cashier
 */
export async function runDailyScheduler(now: Date = new Date()): Promise<void> {
  const db = getEnotifDb();
  const today = formatDateInTimezone(now, TIMEZONE);

  await Promise.all([
    handleTenDayReminders(db, today),
    handleThreeDayReminders(db, today),
    handleDueToday(db, today),
    handleOverdue(db, today),
  ]);
}

async function handleTenDayReminders(db: FirebaseFirestore.Firestore, today: string) {
  const targetDate = addDaysToDateString(today, REMINDER_DAYS_BEFORE_DUE);
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

async function handleThreeDayReminders(db: FirebaseFirestore.Firestore, today: string) {
  const targetDate = addDaysToDateString(today, DEMAND_LETTER_REMINDER_DAYS_BEFORE_DUE);
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

async function handleOverdue(db: FirebaseFirestore.Firestore, today: string) {
  const snap = await db
    .collection("leases")
    .where("status", "in", ["ACTIVE", "FOR PAYMENT"])
    .where("dueDate", "<", today)
    .get();

  const leases = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LeaseDoc);

  for (const lease of leases) {
    await db.collection("leases").doc(lease.id).update({
      status: "OVERDUE",
      updatedAt: new Date().toISOString(),
    });

    if (await wasNotifiedToday(lease.id, "DEMAND_LETTER", today)) continue;

    const penalty = Math.round(lease.annualRental * PENALTY_RATE);
    const pdfBuffer = await generateDemandLetterPdf(lease, penalty);
    const pdfUrl = await uploadDemandLetterPdf(lease.id, pdfBuffer);

    await db.collection("demand_letters").add({
      leaseId: lease.id,
      flaNumber: lease.flaNumber,
      province: lease.assignedPenro,
      cenro: lease.assignedCenro,
      generatedDate: new Date().toISOString(),
      pdfUrl,
      emailStatus: "SENT",
    });

    const template = demandLetterTemplate({
      ...toTemplateData(lease),
      penalty: `PHP ${penalty.toLocaleString()}`,
      currentDate: new Date().toLocaleDateString("en-PH"),
    });

    await sendAndLogNotification({
      lease,
      recipient: lease.email,
      notificationType: "DEMAND_LETTER",
      subject: template.subject,
      html: template.html,
      attachments: [{ filename: `Demand-Letter-${lease.flaNumber}.pdf`, content: pdfBuffer }],
    });

    const recipients = await findRecipientsForLease(lease.assignedPenro, lease.assignedCenro);
    for (const recipient of recipients) {
      await sendAndLogNotification({
        lease,
        recipient: recipient.email,
        notificationType: "DEMAND_LETTER",
        subject: `[Overdue] FLA ${lease.flaNumber} demand letter sent to lessee`,
        html: template.html,
      });
    }

    logger.info(`Lease ${lease.flaNumber} marked OVERDUE, demand letter generated`);
  }
}
