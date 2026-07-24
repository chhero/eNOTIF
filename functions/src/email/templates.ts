// Email templates for the eNOTIF notification module.
// Supports the placeholders described in the project plan:
// {{ApplicantName}} {{FLANumber}} {{Amount}} {{DueDate}} {{Office}}

export interface TemplateData {
  applicantName: string;
  flaNumber: string;
  amount: string;
  dueDate: string;
  office: string;
}

function render(template: string, data: TemplateData): string {
  return template
    .replace(/{{ApplicantName}}/g, data.applicantName)
    .replace(/{{FLANumber}}/g, data.flaNumber)
    .replace(/{{Amount}}/g, data.amount)
    .replace(/{{DueDate}}/g, data.dueDate)
    .replace(/{{Office}}/g, data.office);
}

const BASE_STYLE =
  'font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6;';

function wrap(title: string, body: string): string {
  return `
    <div style="${BASE_STYLE} max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background:#15803d; color:#fff; padding:16px 24px;">
        <h1 style="margin:0; font-size:18px;">DENR &middot; eNOTIF</h1>
        <p style="margin:4px 0 0; font-size:12px; opacity:0.9;">Foreshore Lease Agreement Notification System</p>
      </div>
      <div style="padding:24px;">
        <h2 style="margin-top:0; font-size:16px;">${title}</h2>
        ${body}
      </div>
      <div style="padding:16px 24px; background:#f8fafc; font-size:11px; color:#64748b;">
        This is an automated message from the DENR eNOTIF system. Please do not reply directly to this email.
      </div>
    </div>`;
}

export function tenDayReminderTemplate(data: TemplateData) {
  return {
    subject: `[eNOTIF] Upcoming Rental Due in 10 Days - FLA ${data.flaNumber}`,
    html: wrap(
      "Upcoming Foreshore Lease Rental Due (10 Days)",
      render(
        `<p>This is a reminder that the annual rental for the following Foreshore Lease Agreement is due in <strong>10 days</strong>:</p>
         <ul>
           <li>Applicant: <strong>{{ApplicantName}}</strong></li>
           <li>FLA Number: <strong>{{FLANumber}}</strong></li>
           <li>Amount Due: <strong>{{Amount}}</strong></li>
           <li>Due Date: <strong>{{DueDate}}</strong></li>
           <li>Office: <strong>{{Office}}</strong></li>
         </ul>
         <p>Please prepare for billing and collection follow-up ahead of the due date.</p>`,
        data
      )
    ),
  };
}

export function tenDayLesseeReminderTemplate(data: TemplateData) {
  return {
    subject: `Reminder: Your Foreshore Lease Rental is Due in 10 Days - FLA ${data.flaNumber}`,
    html: wrap(
      "Your Annual Rental Payment is Due Soon",
      render(
        `<p>Dear {{ApplicantName}},</p>
         <p>This is a friendly reminder that your annual rental for Foreshore Lease Agreement <strong>{{FLANumber}}</strong> is due on <strong>{{DueDate}}</strong> (10 days from now).</p>
         <p>Amount Due: <strong>{{Amount}}</strong></p>
         <p>Please settle your payment with the {{Office}} on or before the due date to avoid penalties.</p>`,
        data
      )
    ),
  };
}

export function threeDayReminderTemplate(data: TemplateData) {
  return {
    subject: `Urgent Reminder: Rental Due in 3 Days - FLA ${data.flaNumber}`,
    html: wrap(
      "Urgent: Payment Due in 3 Days",
      render(
        `<p>Dear {{ApplicantName}},</p>
         <p>Your annual rental for Foreshore Lease Agreement <strong>{{FLANumber}}</strong> is due in <strong>3 days</strong>, on <strong>{{DueDate}}</strong>.</p>
         <p>Amount Due: <strong>{{Amount}}</strong></p>
         <p>Please settle your payment with the {{Office}} as soon as possible to avoid your account becoming overdue.</p>`,
        data
      )
    ),
  };
}

export function paymentConfirmationTemplate(data: TemplateData) {
  return {
    subject: `Payment Received - FLA ${data.flaNumber}`,
    html: wrap(
      "Payment Confirmation",
      render(
        `<p>Dear {{ApplicantName}},</p>
         <p>We confirm receipt of your annual rental payment of <strong>{{Amount}}</strong> for Foreshore Lease Agreement <strong>{{FLANumber}}</strong>.</p>
         <p>Thank you for your prompt payment.</p>
         <p>{{Office}}</p>`,
        data
      )
    ),
  };
}

export function demandLetterTemplate(data: TemplateData & { penalty: string; currentDate: string }) {
  return {
    subject: `Demand Letter - Overdue Rental for FLA ${data.flaNumber}`,
    html: wrap(
      "Demand Letter: Overdue Annual Rental",
      render(
        `<p>Dear {{ApplicantName}},</p>
         <p>Our records show that the annual rental for Foreshore Lease Agreement <strong>{{FLANumber}}</strong>, which was due on <strong>{{DueDate}}</strong>, remains unpaid as of <strong>${data.currentDate}</strong>.</p>
         <ul>
           <li>Amount Due: <strong>{{Amount}}</strong></li>
           <li>Penalty: <strong>${data.penalty}</strong></li>
         </ul>
         <p>You are hereby required to settle your outstanding balance with the {{Office}} within fifteen (15) days from receipt of this letter to avoid further action, which may include cancellation of your lease agreement.</p>
         <p>A formal copy of this demand letter is attached as PDF.</p>`,
        data
      )
    ),
  };
}
