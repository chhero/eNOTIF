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
}): Promise<void> {
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
    });
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
    });
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
