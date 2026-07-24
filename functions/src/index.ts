import { initializeApp } from "firebase-admin/app";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

import { TIMEZONE } from "./constants";
import { getEnotifDb } from "./db";
import { runDailyScheduler } from "./scheduler/dailyCheck";
import { SMTP_USER, SMTP_PASS } from "./email/transporter";
import { sendAndLogNotification } from "./email/send";
import { paymentConfirmationTemplate } from "./email/templates";
import type { LeaseDoc } from "./types";

initializeApp();

/**
 * Daily scheduler: runs once every day at 06:00 Asia/Manila time.
 * Implements the notification rules described in the eNOTIF project plan:
 * 10-day reminders, 3-day reminders, due-today status updates, and
 * overdue demand letter generation.
 */
export const dailyScheduler = onSchedule(
  {
    schedule: "0 6 * * *",
    timeZone: TIMEZONE,
    secrets: [SMTP_USER, SMTP_PASS],
    region: "asia-east1",
  },
  async () => {
    await runDailyScheduler();
  }
);

/**
 * Fires whenever a cashier records a payment. Sends a payment confirmation
 * email to the lessee. Marking the lease PAID and writing the audit log is
 * already handled synchronously by the Next.js API route (src/lib/data/payments.ts)
 * so the collection dashboard updates immediately; this trigger only
 * handles the outbound confirmation email, matching the plan's
 * "After payment -> stop reminders, update dashboard, create audit log" rule.
 */
export const onPaymentCreated = onDocumentCreated(
  {
    document: "payments/{paymentId}",
    database: "enotif",
    secrets: [SMTP_USER, SMTP_PASS],
    region: "asia-east1",
  },
  async (event) => {
    const payment = event.data?.data();
    if (!payment) return;

    const db = getEnotifDb();
    const leaseSnap = await db.collection("leases").doc(payment.leaseId).get();
    if (!leaseSnap.exists) {
      logger.warn(`Payment recorded for missing lease ${payment.leaseId}`);
      return;
    }

    const lease = { id: leaseSnap.id, ...leaseSnap.data() } as LeaseDoc;
    const template = paymentConfirmationTemplate({
      applicantName: lease.applicantName,
      flaNumber: lease.flaNumber,
      amount: `PHP ${Number(payment.amount).toLocaleString()}`,
      dueDate: lease.dueDate,
      office: lease.assignedPenro,
    });

    await sendAndLogNotification({
      lease,
      recipient: lease.email,
      notificationType: "PAYMENT_CONFIRMATION",
      subject: template.subject,
      html: template.html,
    });
  }
);
