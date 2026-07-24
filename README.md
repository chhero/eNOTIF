# eNOTIF

**Electronic Notification System for Foreshore Lease Administration**
DENR Region VIII &middot; Internal web application (authorized personnel only)

eNOTIF automates billing reminders, internal notifications, demand letters, and
collection monitoring for annual Foreshore Lease Agreement (FLA) rentals, so
lessees no longer miss payment deadlines simply because they forgot. See
[PlanMD](PlanMD) for the full functional specification.

## Tech Stack

- **Frontend/API**: Next.js (App Router, TypeScript, Tailwind CSS)
- **Auth**: Firebase Authentication (email/password) + HttpOnly session cookies
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (demand letter PDFs, payment proofs)
- **Scheduler & emails**: Firebase Cloud Functions (scheduled function) + Nodemailer over Gmail/Google Workspace SMTP
- **Hosting**: Firebase Hosting (Next.js web frameworks integration)

## Project Structure

```
src/
  app/
    login/                 Public login page
    (dashboard)/           Authenticated app shell (sidebar/topbar) + pages
      dashboard/           Stats overview
      leases/               Lease list, registration form, detail/edit
      payments/            Cashier payment recording
      notifications/       Notification history
      reports/             Collection reports & analytics + CSV export
      users/               User management (Regional Admin only)
      audit-logs/          Audit trail (Regional Admin only)
    api/                   Next.js API routes (Firebase Admin SDK, RBAC enforced)
  components/              Client/server UI components
  lib/
    firebase/               Client + Admin SDK initializers
    auth/                   Session cookie helpers
    data/                   Firestore data-access layer (server-only)
    validation/             Zod schemas
    rbac.ts                 Role-permission matrix
functions/                  Cloud Functions: daily scheduler, demand letters, emails
firestore.rules             Firestore security rules (defense-in-depth)
firestore.indexes.json      Composite indexes
storage.rules               Storage security rules
```

## User Roles

| Role | Key permissions |
| --- | --- |
| Regional Administrator | Full access, manage users, view all records, reports, configure system |
| PENRO Administrator | Register/edit leases, approve registrations, view own province, reports |
| CENRO Personnel | View assigned leases, update monitoring records, print reports |
| Cashier | View upcoming collections, record payments, print receipts |

Role, PENRO province, and CENRO office are stored on each user's Firestore
profile (`users/{uid}`) and mirrored into Firebase Auth custom claims
(`enotif_role`, `enotif_province`, `enotif_cenro`) so Firestore security rules
can scope access without extra reads. These claims are namespaced with an
`enotif_` prefix because the Firebase project is shared with other DENR
Region VIII systems (eSAPA, eNOTIG) that use the same Authentication user
pool — this avoids clobbering claims set by those apps.

## Firebase Project

eNOTIF runs inside the shared **esapa-denr-r8** Firebase project (alongside
eSAPA and eNOTIG), but with its own **named Firestore database, `enotif`**
(not the project's `(default)` database) so its collections never collide
with the other systems' data. Firebase Authentication, however, is one pool
per *project* — eNOTIF logins share the same Auth user directory as
eSAPA/eNOTIG.

## One-time Firebase Project Setup

1. The project (`esapa-denr-r8`) and the `enotif` Firestore database already
   exist. If setting this up from scratch elsewhere, create a project, then
   create a second named database with:
   ```bash
   firebase firestore:databases:create enotif --location <region>
   ```
2. Enable **Authentication** (Email/Password provider) and **Storage** if not
   already enabled for the project.
3. Register a Web App (`firebase apps:create WEB eNOTIF --project esapa-denr-r8`)
   and copy its config into `.env.local` (copy `.env.local.example` first) —
   these `NEXT_PUBLIC_*` values are safe to expose client-side.
4. Generate a service account key: *Project settings > Service accounts >
   Generate new private key*. Save the JSON somewhere **outside** the repo and
   set `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` in `.env.local` to its path (or
   paste the JSON into `FIREBASE_SERVICE_ACCOUNT_JSON` as a single line).
   **Never paste a service account key into chat, a commit, or a shared doc**
   — if one is ever exposed, revoke it immediately in Google Cloud Console >
   IAM & Admin > Service Accounts > Keys.
5. `.firebaserc` already points `default` at `esapa-denr-r8`.
6. Create a Gmail/Google Workspace account (or app password) for outbound
   mail, then set the Cloud Functions secrets (values are entered at an
   interactive, hidden prompt — never pass them as command-line arguments):
   ```bash
   firebase functions:secrets:set SMTP_USER
   firebase functions:secrets:set SMTP_PASS
   ```
   Note: Cloud Functions (and therefore these secrets) require the project to
   be on the **Blaze (pay-as-you-go)** plan — see
   https://console.firebase.google.com/project/esapa-denr-r8/usage/details.
   Normal usage (a once-daily scheduler + occasional triggers) stays well
   within the free tier.
7. Seed the first Regional Administrator account:
   1. Create the Auth user (email + password) directly in the
      [Firebase Console](https://console.firebase.google.com/project/esapa-denr-r8/authentication/users) —
      never via chat or a script argument.
   2. Grant it the `regional_admin` role by email (no password needed):
      ```bash
      node --env-file=.env.local scripts/seed-admin.js \
        --email=admin@denr.gov.ph --name="Your Name" --role=regional_admin
      ```
   3. Reuse `scripts/seed-admin.js` for PENRO/CENRO/cashier accounts too, e.g.
      `--role=penro_admin --province="PENRO Samar"` or
      `--role=cenro_personnel --province="PENRO Samar" --cenro="CENRO 1"`.

## Local Development

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to `/login`.

### Cloud Functions (scheduler)

```bash
cd functions
npm install
npm run build
```

Use the Firebase Emulator Suite to test the scheduler and Firestore triggers
locally without touching production data:

```bash
firebase emulators:start
```

## Deployment

```bash
# Build & deploy Firestore/Storage rules, Cloud Functions, and Hosting (Next.js SSR)
firebase deploy
```

Firebase Hosting's web frameworks integration detects the Next.js app at the
repo root (see `firebase.json`) and deploys it as a managed Cloud Function
automatically — no separate build step is required beyond `firebase deploy`.

## Security Notes

- All write access is enforced server-side in Next.js API routes
  (`src/app/api/**`) using the Firebase Admin SDK and the RBAC matrix in
  `src/lib/rbac.ts`. Firestore rules (`firestore.rules`) are a defense-in-depth
  layer for direct client reads/listeners.
- Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- All user input is validated server-side with Zod (`src/lib/validation`)
  before touching Firestore.
- Never commit `.env.local`, `serviceAccountKey.json`, or any Firebase service
  account credentials — these are already covered by `.gitignore`. Never paste
  them into chat, issues, or docs either; if one is ever exposed, revoke it
  immediately (Google Cloud Console > IAM & Admin > Service Accounts > Keys).
- Cloud Functions read SMTP credentials from Firebase Functions **secrets**,
  never from source or plaintext config.
- Custom claims are namespaced (`enotif_role`, `enotif_province`,
  `enotif_cenro`) since Authentication is shared with other DENR R8 apps in
  the same Firebase project; `scripts/seed-admin.js` merges rather than
  overwrites claims for this reason.

## Daily Scheduler Logic

Implemented in `functions/src/scheduler/dailyCheck.ts`, running once daily at
06:00 Asia/Manila time:

1. **10 days before due** → email Assigned PENRO, Assigned CENRO, Cashier, and the lessee.
2. **3 days before due** → email reminder to the lessee.
3. **Due today** → mark lease `FOR PAYMENT` if still unpaid.
4. **Past due, still unpaid** → mark `OVERDUE`, generate a PDF demand letter
   (uploaded to Firebase Storage), email it to the lessee, and notify the
   Assigned PENRO and Cashier.

Recording a payment (`src/lib/data/payments.ts`) immediately marks the lease
`PAID`, which stops further reminders, and a Firestore trigger
(`onPaymentCreated` in `functions/src/index.ts`) sends a payment confirmation
email to the lessee.

## Future Enhancements

SMS notifications, GIS property mapping, QR code verification, digital
signatures, a mobile app, an online payment gateway, DENR Single Sign-On, and
AI-based collection forecasting (see [PlanMD](PlanMD)).

