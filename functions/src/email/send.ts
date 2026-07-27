import * as logger from "firebase-functions/logger";
import { getEnotifDb } from "../db";
import { getTransporter, SMTP_USER } from "./transporter";
import type { LeaseDoc } from "../types";

export type NotificationType =
  | "10_DAY_REMINDER"
  | "3_DAY_REMINDER"
  | "PAYMENT_CONFIRMATION"
  | "DEMAND_LETTER";

/**
 * Sends an email and logs the outcome to the `notifications` Firestore
 * collection so it is visible in the eNOTIF web app's Notification module.
 */
export async function sendAndLogNotification(params: {
  lease: Pick<LeaseDoc, "id" | "flaNumber" | "assignedPenro" | "assignedCenro">;
  recipient: string;
  notificationType: NotificationType;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
  pdfUrl?: string;
}): Promise<boolean> {
  const db = getEnotifDb();
  const sentDate = new Date().toISOString();

  try {
    await getTransporter().sendMail({
      from: `"DENR eNOTIF" <${SMTP_USER.value()}>`,
      to: params.recipient,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    });

    await db.collection("notifications").add({
      leaseId: params.lease.id,
      flaNumber: params.lease.flaNumber,
      province: params.lease.assignedPenro,
      cenro: params.lease.assignedCenro,
      recipient: params.recipient,
      notificationType: params.notificationType,
      sentDate,
      status: "SENT",
      ...(params.pdfUrl !== undefined && { pdfUrl: params.pdfUrl }),
    });

    return true;
  } catch (error) {
    logger.error("Failed to send notification email", {
      leaseId: params.lease.id,
      recipient: params.recipient,
      notificationType: params.notificationType,
      error: String(error),
    });

    await db.collection("notifications").add({
      leaseId: params.lease.id,
      flaNumber: params.lease.flaNumber,
      province: params.lease.assignedPenro,
      cenro: params.lease.assignedCenro,
      recipient: params.recipient,
      notificationType: params.notificationType,
      sentDate,
      status: "FAILED",
      error: String(error),
      ...(params.pdfUrl !== undefined && { pdfUrl: params.pdfUrl }),
    });

    return false;
  }
}

/** True if a notification of this type was already sent for this lease today (idempotency guard). */
export async function wasNotifiedToday(
  leaseId: string,
  notificationType: NotificationType,
  todayDateStr: string
): Promise<boolean> {
  const db = getEnotifDb();
  const snap = await db
    .collection("notifications")
    .where("leaseId", "==", leaseId)
    .where("notificationType", "==", notificationType)
    .where("status", "==", "SENT")
    .get();

  return snap.docs.some((doc) => (doc.data().sentDate as string).startsWith(todayDateStr));
}

/**
 * True if a notification of this type was EVER successfully sent for this lease
 * (no date restriction). Used for one-time notifications like the demand letter,
 * so a transient failure (e.g. bad SMTP credentials) gets retried on the next
 * scheduler run instead of being silently lost forever.
 */
export async function wasEverNotified(
  leaseId: string,
  notificationType: NotificationType
): Promise<boolean> {
  const db = getEnotifDb();
  const snap = await db
    .collection("notifications")
    .where("leaseId", "==", leaseId)
    .where("notificationType", "==", notificationType)
    .where("status", "==", "SENT")
    .limit(1)
    .get();

  return !snap.empty;
}
