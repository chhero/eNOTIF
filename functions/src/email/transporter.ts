import * as nodemailer from "nodemailer";
import { defineSecret } from "firebase-functions/params";

// SMTP credentials are provided as Firebase Functions secrets so they are
// never committed to source control. Set them with:
//   firebase functions:secrets:set SMTP_USER
//   firebase functions:secrets:set SMTP_PASS
export const SMTP_USER = defineSecret("SMTP_USER");
export const SMTP_PASS = defineSecret("SMTP_PASS");

let cachedTransporter: nodemailer.Transporter | null = null;

/** Lazily creates a Nodemailer transporter using Gmail/Google Workspace SMTP. */
export function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_USER.value(),
      pass: SMTP_PASS.value(),
    },
  });

  return cachedTransporter;
}
