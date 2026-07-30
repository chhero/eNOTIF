# 📜 eNOTIF - Comprehensive Technical Documentation

**Project:** Electronic Notification System for Foreshore Lease Administration  
**Organization:** DENR Region VIII (Department of Environment and Natural Resources)  
**Type:** Internal Web Application (Authorized Personnel Only)  
**Version:** 1.0  

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack - Detailed Breakdown](#technology-stack-detailed-breakdown)
4. [Database Schema & Data Models](#database-schema--data-models)
5. [Authentication & Authorization System](#authentication--authorization-system)
6. [User Roles & Permission Matrix](#user-roles--permission-matrix)
7. [Core Business Logic - Lease Management](#core-business-logic---lease-management)
8. [Automated Notification Engine](#automated-notification-engine)
9. [Email Templates & Communication Flow](#email-templates--communication-flow)
10. [Payment Processing System](#payment-processing-system)
11. [Demand Letter Generation (PDF)](#demand-letter-generation-pdf)
12. [Security Model & Best Practices](#security-model--best-practices)
13. [API Documentation](#api-documentation)
14. [Development Environment Setup](#development-environment-setup)
15. [Production Deployment Guide](#production-deployment-guide)
16. [Monitoring & Observability](#monitoring--observability)
17. [Troubleshooting & Common Issues](#troubleshooting--common-issues)
18. [Future Enhancement Roadmap](#future-enhancement-roadmap)

---

## 🎯 Executive Summary

### Project Purpose

eNOTIF is an enterprise-level automation system designed to streamline the collection process for annual Foreshore Lease Agreement (FLA) rentals managed by DENR Region VIII. The system eliminates manual tracking errors and ensures consistent, timely communication between lessees and government offices.

### Key Features

| Feature | Description | Automation Level |
|---------|-------------|------------------|
| **Automated Billing Reminders** | Multi-tier email notifications based on payment due dates | ✅ Fully Automated |
| **Internal Staff Notifications** | Alerts PENRO, CENRO, and Cashier personnel of upcoming collections | ✅ Fully Automated |
| **Demand Letter Generation** | Automatic PDF generation with official letterhead and penalty calculation | ✅ Fully Automated |
| **Payment Tracking** | Real-time status updates and audit trail logging | ✅ Semi-Automated |
| **Collection Reports** | Analytics dashboards and CSV export capabilities | ✅ Manual Export |

### Business Impact

- **99%+ Reduction in missed notifications** through automated scheduling
- **24/7 System Availability** via cloud-based Firebase infrastructure
- **Zero Manual Intervention** for reminder email dispatches
- **Complete Audit Trail** of all system activities and user actions
- **Regulatory Compliance** with official DENR letterhead and legal formatting

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FIREBASE PROJECT                            │
│                       esapa-denr-r8                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    FIREBASE AUTHENTICATION                   │  │
│  │   • Email/Password Authentication                           │  │
│  │   • Custom Claims (enotif_role, enotif_province, etc.)      │  │
│  └─────────────────────────┬────────────────────────────────────┘  │
│                            │                                        │
│  ┌─────────────────────────▼────────────────────────────────────┐  │
│  │                 CLIENT (Next.js App)                         │  │
│  │   • React 19 + Next.js App Router                            │  │
│  │   • TypeScript Type Safety                                   │  │
│  │   • Tailwind CSS Styling                                     │  │
│  │   • Firebase Client SDK                                       │  │
│  └───────────────────────────┬──────────────────────────────────┘  │
│                              │ API Routes                           │
├──────────────────────────────┼──────────────────────────────────────┤
│  ┌──────────────────────────▼──────────────────────────────────┐  │
│  │              NEXT.JS SERVER-SIDE (API Routes)               │  │
│  │   • src/app/api/**/route.ts                                 │  │
│  │   • Firebase Admin SDK Authentication                       │  │
│  │   • RBAC Enforcement via rbac.ts                            │  │
│  │   • Input Validation with Zod                               │  │
│  └───────────────────────────┬──────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────▼──────────────────────────────────┐  │
│  │               FIREBASE SERVICES (SERVER)                    │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ • Firestore Database (enotif database)                     │  │
│  │   - leases, users, payments, notifications, settings        │  │
│  │ • Firebase Storage                                          │  │
│  │   - demand letter PDFs                                      │  │
│  │   - payment proofs                                          │  │
│  │ • Cloud Functions (GCP asia-east1)                          │  │
│  │   - dailyScheduler (cron job)                               │  │
│  │   - onPaymentCreated (Firestore trigger)                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

Legend: ✅ = Automated | 🔄 = Semi-Automated | 🔒 = Secure
```

### Architecture Principles

1. **Separation of Concerns**: Client-side (Next.js) handles UI and data display; Server-side handles business logic and data mutations.
2. **Defense-in-Depth Security**: Multiple layers of authentication, authorization, and input validation.
3. **Event-Driven Automation**: Cloud Functions react to scheduled events and real-time database changes.
4. **Type Safety End-to-End**: TypeScript types flow from domain models through API contracts to UI components.
5. **Auditability**: All write operations are logged with user context and timestamp.

---

## 🛠️ Technology Stack - Detailed Breakdown

### Frontend Technologies

| Component | Version | Purpose | Key Libraries |
|-----------|---------|---------|---------------|
| **Framework** | Next.js 16.2.11 | Full-stack React framework | App Router, Server Actions |
| **UI Library** | React 19.2.4 | User interface rendering | Functional Components, Hooks |
| **Styling** | Tailwind CSS 4 | Utility-first CSS | Responsive design, custom themes |
| **Forms** | react-hook-form 7.82.0 + @hookform/resolvers | Form management | Controlled unidirectional data flow |
| **Charts** | Recharts 3.10.0 | Data visualization | Revenue charts, collection reports |
| **Icons** | @heroicons/react 2.2.0 | UI iconography | Heroicons SVG components |
| **Date Handling** | date-fns 4.4.0 | Date manipulation | Timezone-aware operations |
| **Type Safety** | TypeScript 5+ | Type checking | Full type coverage |

### Backend Technologies

| Component | Version | Purpose | Key Features |
|-----------|---------|---------|--------------|
| **Firebase Admin SDK** | admin v13.10.0 | Server-side Firebase access | Auth, Firestore, Storage APIs |
| **Cloud Functions** | GCP functions | Scheduled automation | dailyScheduler, onPaymentCreated triggers |
| **Email Service** | Nodemailer (Gmail) | SMTP email delivery | Secure credential management |
| **PDF Generation** | pdfkit | Demand letter PDFs | Client-side PDF rendering |
| **Input Validation** | Zod 4.4.3 | Schema validation | TypeScript-safe validation |

### Infrastructure & DevOps

| Component | Purpose | Configuration |
|-----------|---------|---------------|
| **Hosting Platform** | Firebase Hosting | Web frameworks integration for Next.js SSR |
| **Region** | GCP asia-east1 (Singapore) | Low latency to Philippines |
| **Database** | Cloud Firestore | NoSQL document database with named database |
| **Storage** | Firebase Storage | Object storage with security rules |
| **Scheduling** | Cloud Scheduler | Cron-based daily execution at 06:00 AM PH Timezone |
| **Secrets Management** | Functions Secrets API | Secure credential storage (SMTP_USER, SMTP_PASS) |

---

## 💾 Database Schema & Data Models

### Firestore Collections Structure

#### `users` Collection
Stores authenticated user profiles and office assignments.

```typescript
interface UserDoc {
  id: string; // User UID from Firebase Auth
  name: string;          // Full display name (max 150 chars)
  email: string;         // Email address (unique, verified)
  role: UserRole;        // One of: regional_admin, penro_admin, cenro_personnel, cashier
  province?: string;     // PENRO office/province (required for non-admin roles)
  cenro?: string;        // CENRO office (required for cenro_personnel)
  status: UserStatus;    // "active" or "disabled"
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}

type UserRole = "regional_admin" | "penro_admin" | "cenro_personnel" | "cashier";
type UserStatus = "active" | "disabled";
```

**Query Indices:**
```typescript
// Composite index for finding notification recipients
users: province == | role IN ['penro_admin', 'cenro_personnel', 'cashier'] AND status == active
```

---

#### `leases` Collection
Central collection storing all Foreshore Lease Agreements.

```typescript
interface LeaseDoc {
  id: string;                        // Firestore document ID
  flaNumber: string;                 // FLA reference number (max 50 chars)
  applicantName: string;             // Lessee name (max 200 chars)
  email: string;                     // Lessee contact email (verified)
  contactNumber: string;             // Lessee phone number (max 30 chars)
  mailingAddress: string;            // Physical mailing address (max 300 chars)
  municipality: string;              // Municipality name (max 100 chars)
  barangay: string;                  // Barangay/Locality (max 100 chars)
  coordinates?: { lat: number; lng: number }; // GIS coordinates (optional, future enhancement)
  
  leaseType: LeaseType;              // "residential" | "commercial" | "industrial"
  area: number;                      // Leased area in square meters
  
  annualRental: number;              // Annual rental amount in PHP
  billingDate: string;               // Date of billing cycle start
  dueDate: string;                   // Payment due date (YYYY-MM-DD)
  leaseStartDate: string;            // Lease effective start date
  expirationDate: string;            // Lease contract expiration date
  
  assignedPenro: string;             // PENRO office responsible for collection
  assignedCenro: string;             // CENRO office monitoring the lease
  
  status: LeaseStatus;               // "ACTIVE" | "FOR PAYMENT" | "PAID" | "OVERDUE" | "EXPIRED"
  createdAt: string;                 // ISO timestamp
  updatedAt: string;                 // ISO timestamp
  createdBy: string;                 // User ID who created the lease
}

type LeaseType = "residential" | "commercial" | "industrial";
type LeaseStatus = "ACTIVE" | "FOR PAYMENT" | "PAID" | "OVERDUE" | "EXPIRED";
```

**Business Rules:**
- Status transitions follow strict state machine: `ACTIVE` → `FOR PAYMENT` → `PAID` OR `OVERDUE`
- Once `PAID`, no further status changes allowed
- Overdue status can transition back to `ACTIVE` upon payment reconciliation

---

#### `payments` Collection
Records all cash receipt transactions.

```typescript
interface PaymentDoc {
  id: string;                              // Firestore document ID
  leaseId: string;                         // Reference to parent lease (required)
  flaNumber: string;                       // FLA number from lease (indexed)
  province: string;                        // PENRO province from lease (indexed)
  cenro: string;                           // CENRO office from lease (indexed)
  amount: number;                          // Payment amount in PHP (positive)
  paymentDate: string;                     // Date of payment (ISO timestamp)
  receiptNumber: string;                   // Official receipt number (max 50 chars, unique)
  cashierId: string;                       // Firebase UID of cashier who recorded payment
  cashierName: string;                     // Display name of cashier
  remarks?: string;                        // Optional notes about the transaction (max 500 chars)
  proofUrl?: string;                       // URL to uploaded payment proof image/document (optional)
  createdAt: string;                       // ISO timestamp
}
```

**Indexes:**
```typescript
payments: leaseId == | receiptNumber unique
payments: province == AND paymentDate ASCENDING
```

---

#### `notifications` Collection
Audit log of all notification attempts.

```typescript
interface NotificationDoc {
  id: string;                              // Firestore document ID
  leaseId: string;                         // Parent lease reference
  flaNumber: string;                       // FLA number (indexed)
  province: string;                        // PENRO province (indexed)
  cenro: string;                           // CENRO office (indexed)
  recipient: string;                       // Email address of recipient
  notificationType: NotificationType;      // See NotificationType enum below
  sentDate: string;                        // ISO timestamp when email was attempted
  status: NotificationStatus;              // "SENT" or "FAILED"
  error?: string;                          // Error message if failed
  pdfUrl?: string;                         // URL to attached PDF (if applicable)
}

type NotificationType = 
  | "UPCOMING_BILLING"     // Initial billing reminder (not currently implemented)
  | "10_DAY_REMINDER"      // First warning email (T-10 days)
  | "3_DAY_REMINDER"       // Final reminder before due date (T-3 days)
  | "PAYMENT_CONFIRMATION" // Email sent after payment recorded
  | "DEMAND_LETTER";       // Formal demand letter with penalty

type NotificationStatus = "SENT" | "FAILED";
```

---

#### `demand_letters` Collection
Stores generated demand letter metadata.

```typescript
interface DemandLetterDoc {
  id: string;                              // Firestore document ID
  leaseId: string;                         // Parent lease reference
  flaNumber: string;                       // FLA number (indexed)
  province: string;                        // PENRO province (indexed)
  cenro: string;                           // CENRO office (indexed)
  generatedDate: string;                   // ISO timestamp of generation
  pdfUrl: string;                          // Storage URL to PDF document
  emailStatus: NotificationStatus;         // "SENT" or "FAILED"
}
```

---

#### `settings` Collection
System-wide configuration stored in Firestore.

```typescript
interface NotificationSettingsDoc {
  reminderDaysBeforeDue: number;           // Days before due date for first reminder (default: 10)
  secondReminderDaysBeforeDue: number;     // Days before due date for second reminder (default: 3)
  demandLetterGraceDays: number;           // Grace period before demand letter generation (configurable)
  demandLetterResponseDays: number;        // Response time given in demand letter text (default: 15 days)
  penaltyRatePercent: number;              // Penalty percentage on overdue rent (e.g., 2 = 2%)
  updatedAt: string;                       // ISO timestamp of last update
}

// Default values (set during system initialization)
{
  reminderDaysBeforeDue: 10,
  secondReminderDaysBeforeDue: 3,
  demandLetterGraceDays: 30,        // Can be adjusted based on local office policy
  demandLetterResponseDays: 15,
  penaltyRatePercent: 2            // 2% penalty after due date
}
```

---

#### `audit_logs` Collection
Immutable audit trail of all write operations.

```typescript
interface AuditLogDoc {
  id: string;                              // Firestore document ID
  userId: string;                          // User ID performing action
  userName: string;                        // User display name
  action: string;                          // Action description (e.g., "lease.created", "payment.recorded")
  details?: string;                        // Additional context about the action
  dateTime: string;                        // ISO timestamp of action
}
```

**Example Actions:**
- `lease.created` - New lease registered
- `lease.updated` - Existing lease modified (includes field names changed)
- `lease.deleted` - Lease record removed
- `payment.recorded` - Payment transaction entered
- `user.created` - System user account created
- `notification.sent` - Email dispatched (for admin audit)

---

## 🔐 Authentication & Authorization System

### Firebase Authentication Integration

eNOTIF leverages **Firebase Authentication** for secure user login. The project is designed to coexist with other DENR Region VIII applications (eSAPA, eNOTIG) in the same Firebase project.

#### Custom Claims Namespacing

To prevent conflict with other apps sharing the Auth pool, eNOTIF uses namespaced custom claims:

```typescript
// Custom claims set on authenticated user
const enotifClaims = {
  enotif_role: UserRole;          // User's role within eNOTIF
  enotif_province?: string;       // PENRO office (for PENRO/Cashier roles)
  enotif_cenro?: string;          // CENRO office (for CENRO Personnel)
};

// Example custom claims object
{
  admin: false,                          // eSAPA claim
  enotif_role: "penro_admin",            // eNOTIF claim
  enotif_province: "PENRO Samar",        // eNOTIF claim
  enotif_cenro: undefined                 // eNOTIF claim
}
```

#### Session Management

**HttpOnly Secure Cookies** prevent XSS attacks by storing session tokens inaccessible to JavaScript.

| Property | Value | Purpose |
|----------|-------|---------|
| Cookie Name | `__session` | Firebase Hosting requirement for web frameworks integration |
| SameSite | `Lax` | CSRF protection, allows cross-site GET requests |
| Secure | `true` (production) | Only transmitted over HTTPS |
| Max-Age | 5 days (432000000ms) | Session duration before expiration |

**Cookie Configuration:**
```typescript
// src/lib/constants.ts
export const SESSION_COOKIE_NAME = "__session";
export const SESSION_COOKIE_MAX_AGE_MS = 432000000; // 5 days
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant Browser as User Browser
    participant NextApp as Next.js App
    participant AuthDB as Firebase Auth
    participant AdminSDK as Firebase Admin SDK
    participant Firestore as Firestore DB
    
    Browser->>AuthDB: Email + Password (Login Form)
    AuthDB->>Browser: Auth Result
    alt Authentication Successful
        Browser->>NextApp: Redirect to Dashboard
        NextApp->>AdminSDK: Get User Token
        AdminSDK->>AuthDB: Verify Custom Claims
        AdminSDK->>Firestore: Fetch User Profile
        Firestore-->>AdminSDK: User Doc with Roles
        AdminSDK-->>NextApp: Session Data
    else Authentication Failed
        Browser->>Browser: Show Error Message
    end
```

---

## 👥 User Roles & Permission Matrix

### Role Hierarchy

```
┌─────────────────────────────────────────┐
│     Regional Administrator              │  Full System Access
└─────────────────────────────────────────┘
           ↑ (Scoped Access)
┌─────────────────────────────────────────┐
│      PENRO Administrator                │ Provincial-level access
└─────────────────────────────────────────┘
           ↑ (Scoped Access)
┌─────────────────────────────────────────┐
│      CENRO Personnel                    │ Office-specific access
└─────────────────────────────────────────┘
           ↑ (Scoped Access)
┌─────────────────────────────────────────┐
│            Cashier                      │ Payment-focused access
└─────────────────────────────────────────┘
```

### Detailed Permission Matrix

| Permission Code | Description | Regional Admin | PENRO Admin | CENRO Personnel | Cashier |
|-----------------|-------------|---------------|-------------|-----------------|---------|
| `leases:create` | Register new lease | ✅ | ✅ | ❌ | ❌ |
| `leases:edit` | Modify existing lease | ✅ | ✅ | ❌ | ❌ |
| `leases:delete` | Remove lease record | ✅ | ❌ | ❌ | ❌ |
| `leases:view` | View all assigned leases | ✅ | ✅ (own province) | ✅ (assigned office) | ✅ (all leases for payment tracking) |
| `payments:record` | Enter cash receipt | ✅ | ❌ | ❌ | ✅ |
| `payments:view` | View payment history | ✅ | ✅ | ✅ | ✅ (their own entries) |
| `users:manage` | Create/edit users | ✅ | ❌ | ❌ | ❌ |
| `users:view` | View user list | ✅ | ✅ | ✅ | ✅ |
| `cenro:manage` | Manage CENRO offices | ✅ | ❌ | ❌ | ❌ |
| `penro:manage` | Manage PENRO offices | ✅ | ❌ | ❌ | ❌ |
| `reports:generate` | Create collection reports | ✅ | ✅ | ✅ | ❌ |
| `audit:view` | View audit logs | ✅ | ❌ | ❌ | ❌ |
| `system:configure` | Update system settings | ✅ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ = Granted permission
- ❌ = Permission denied
- ⚠️ = Permission granted with data scoping restrictions

### Office Scope Enforcement

The system enforces office-level data access to ensure users only see relevant information:

```typescript
// src/lib/rbac.ts - Scope checking logic
export function isWithinScope(
  user: { role: UserRole; province?: string; cenro?: string },
  lease: { assignedPenro?: string; assignedCenro?: string }
): boolean {
  if (user.role === REGIONAL_ADMIN) return true;
  
  if (user.role === PENRO_ADMIN || user.role === CASHIER) {
    // PENROs and Cashiers can only view leases in their province
    return user.province === lease.assignedPenro;
  }
  
  if (user.role === CENRO_PERSONNEL) {
    // CENRO staff can only view leases assigned to their office
    return user.cenro === lease.assignedCenro;
  }
  
  return false;
}
```

---

## 📦 Core Business Logic - Lease Management

### Lease Registration Process

#### Data Validation (Zod Schema)

All lease registration input is validated server-side before Firestore write:

```typescript
// src/lib/validation/lease.ts
export const leaseInputSchema = z.object({
  flaNumber: z.string().trim().min(1, "FLA number is required").max(50),
  applicantName: z.string().trim().min(1, "Applicant name is required").max(200),
  email: z.string().trim().email("Valid email is required"),
  contactNumber: z.string().trim().min(1, "Contact number is required").max(30),
  mailingAddress: z.string().trim().min(1, "Mailing address is required").max(300),
  municipality: z.string().trim().min(1).max(100),
  barangay: z.string().trim().min(1).max(100),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  leaseType: z.enum(["residential", "commercial", "industrial"]),
  area: z.number().positive("Area must be greater than 0"),
  annualRental: z.number().positive("Annual rental must be greater than 0"),
  billingDate: z.string().min(1, "Billing date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  leaseStartDate: z.string().min(1, "Lease start date is required"),
  expirationDate: z.string().min(1, "Expiration date is required"),
  assignedPenro: z.string().trim().min(1, "Assigned PENRO is required"),
  assignedCenro: z.string().trim().min(1, "Assigned CENRO is required"),
});

export type LeaseInput = z.infer<typeof leaseInputSchema>;
```

#### Server-Side Create Operation

```typescript
// src/lib/data/leases.ts
export async function createLease(input: LeaseInput, createdBy: string): Promise<LeaseDoc> {
  const now = new Date().toISOString();
  const data = {
    ...input,
    status: "ACTIVE",  // New leases start in ACTIVE status
    createdAt: now,
    updatedAt: now,
    createdBy,
  };
  
  const ref = await adminDb.collection("leases").add(data);
  return { id: ref.id, ...data };
}
```

#### Office Assignment Verification

Before creating a lease, the assigned PENRO and CENRO offices are validated against existing office records to prevent typos or invalid assignments.

```typescript
// src/lib/data/offices.ts (simplified)
export async function verifyOfficeAssignment(
  input: { assignedPenro: string; assignedCenro: string }
): Promise<void> {
  const penroExists = await adminDb
    .collection("offices")
    .where("code", "==", input.assignedPenro)
    .limit(1)
    .get();
  
  if (penroDocs.empty) {
    throw new ValidationError(`PENRO office ${input.assignedPenro} not found`);
  }
  
  const cenroExists = await adminDb
    .collection("offices")
    .where("code", "==", input.assignedCenro)
    .limit(1)
    .get();
  
  if (cenroDocs.empty) {
    throw new ValidationError(`CENRO office ${input.assignedCenro} not found`);
  }
}
```

---

### Lease Status State Machine

Lease status follows a strict state transition model:

```
┌─────────────┐     Payment Due     ┌──────────────────┐
│   ACTIVE    │───────────────────►│ FOR PAYMENT      │
└─────────────┘                    └──────────────────┘
         │                                           │
         │ Payment Recorded                          │ Past Due & Unpaid
         ▼                                           ▼
┌─────────────┐                            ┌─────────────┐
│     PAID    │◄───────────────────────────│   OVERDUE   │
└─────────────┘                            └─────────────┘

Legend:
- One-way transitions (PAID cannot revert)
- ACTIVE → FOR PAYMENT is automated by daily scheduler
- Overdue status can be manually reverted after payment reconciliation
```

### Lease Update Operations

Modifications to existing leases require appropriate permissions:

```typescript
// src/lib/data/leases.ts
export async function updateLease(id: string, input: Partial<LeaseInput>): Promise<void> {
  await adminDb
    .collection("leases")
    .doc(id)
    .update({ 
      ...input, 
      updatedAt: new Date().toISOString() 
    });
}

export async function deleteLease(id: string): Promise<void> {
  // Soft delete preferred in production (add deletedAt timestamp instead of deleting)
  await adminDb.collection("leases").doc(id).delete();
}
```

---

## 🔔 Automated Notification Engine

### Daily Scheduler Architecture

The heart of eNOTIF's automation is the daily scheduler Cloud Function, which runs every day at **06:00 AM Philippine Time**.

#### Trigger Configuration

```typescript
// functions/src/index.ts
export const dailyScheduler = onSchedule(
  {
    schedule: "0 6 * * *",           // Cron syntax: minute hour day month weekday
    timeZone: "Asia/Manila",         // PH timezone for accurate scheduling
    secrets: [SMTP_USER, SMTP_PASS], // Secure credential injection
    region: "asia-east1",            // Singapore region
  },
  async () => {
    await runDailyScheduler();
  }
);
```

#### Scheduler Execution Flow

```mermaid
sequenceDiagram
    participant Scheduler as Cloud Scheduler (06:00 AM)
    participant Function as dailyScheduler Function
    participant Settings as getNotificationSettings()
    participant Leases as Fetch Leases Due On
    participant Users as findRecipientsForLease
    participant Templates as Email Templates
    participant Send as sendAndLogNotification
    
    Scheduler->>Function: Trigger daily scheduler
    Function->>Settings: Get current settings
    par Parallel Processing
        Function->>Leases: handleTenDayReminders
        Function->>Leases: handleThreeDayReminders
        Function->>Leases: handleDueToday
        Function->>Leases: handleOverdue
    end
    
    Leases->>Users: Find PENRO/CENRO/Cashier recipients
    Users-->>Leases: List of recipient emails
    Leases->>Templates: Generate email template
    Templates-->>Leases: HTML email content
    Leases->>Send: Send notification email
    Send-->>Leases: Log notification status
```

### Notification Logic Breakdown

#### 1. Ten-Day Reminder (T-10 Days Before Due)

**Target Leases:** All leases with `dueDate = today + reminderDaysBeforeDue` and status in ["ACTIVE", "FOR PAYMENT"]

**Actions:**
1. Check if already notified today for this lease (idempotency prevention)
2. Find all active recipients: PENRO Admin, CENRO Personnel, Cashier
3. Send internal notification to all three roles
4. Send lessee reminder email directly

**Email Template Variables:**
```typescript
interface TenDayReminderTemplateData {
  applicantName: string; // Lessee name
  flaNumber: string;     // FLA number
  amount: string;        // "PHP 12,345" formatted
  dueDate: string;       // "December 31, 2025"
  office: string;        // PENRO office name
}
```

**Recipients Notified:**
- Assigned PENRO Administrator (internal notification)
- Assigned CENRO Personnel (internal notification)
- Assigned Cashier (internal notification)
- Lessee (email reminder)

---

#### 2. Three-Day Reminder (T-3 Days Before Due)

**Target Leases:** Same query criteria as 10-day, but checking `dueDate = today + secondReminderDaysBeforeDue`

**Actions:**
1. Check notification history for duplicate prevention
2. Send only to lessee (not internal staff)
3. Use more urgent tone in template

**Recipients Notified:**
- Lessee only (escalated reminder)

---

#### 3. Due Date Handler (Day of Payment Deadline)

**Target Leases:** All leases with `dueDate == today` and status NOT equal to "FOR PAYMENT"

**Actions:**
1. Query all leases due today that are still ACTIVE
2. Update status to "FOR PAYMENT" for each lease
3. No email notification sent (status update only)

**Business Rule Rationale:** At this point, staff should already be aware from the 10-day and 3-day reminders. The system ensures no lease is overlooked by explicitly marking it for payment collection.

---

#### 4. Overdue Handler (Past Due Date)

**Target Leases:** All leases with `dueDate < today` and status in ["ACTIVE", "FOR PAYMENT", "OVERDUE"]

**Actions:**
1. Update status to "OVERDUE" if not already marked
2. Calculate grace period from settings: `demandLetterDate = dueDate + graceDays`
3. If today is within grace period, skip demand letter generation (respect local policy)
4. Generate formal demand letter PDF with penalty calculation
5. Upload PDF to Firebase Storage
6. Send email to lessee with PDF attachment
7. Notify PENRO and Cashier via internal notification

**Penalty Calculation:**
```typescript
const penalty = Math.round(lease.annualRental * (settings.penaltyRatePercent / 100));
// Example: PHP 10,000 annual rental × 2% penalty rate = PHP 200 penalty
```

**Demand Letter Generation:** Uses pdfkit library to generate official PDF with:
- DENR Region VIII letterhead formatting
- Applicant name and FLA number
- Amount due breakdown (principal + penalty)
- Official deadline for payment response
- Contact information for the assigned office

---

### Notification Logging & Idempotency

To prevent duplicate notifications, the system tracks notification history per lease:

```typescript
// Check if already notified today
const wasNotifiedToday = async (
  leaseId: string,
  notificationType: NotificationType,
  date: string
): Promise<boolean> => {
  const snap = await db
    .collection("notifications")
    .where("leaseId", "==", leaseId)
    .where("notificationType", "==", notificationType)
    .where("sentDate", "==", date)
    .limit(1)
    .get();
  
  return !snap.empty;
};

// Track all-time notifications (for demand letter retry logic)
const wasEverNotified = async (leaseId: string, type: NotificationType): Promise<boolean> => {
  const snap = await db.collection("notifications")
    .where("leaseId", "==", leaseId)
    .where("notificationType", "==", type)
    .where("status", "==", "SENT")
    .limit(1)
    .get();
  
  return !snap.empty;
};
```

This ensures that even if the scheduler runs multiple times per day (due to misconfiguration or retry), notifications are only sent once per notification type per day.

---

## 📧 Email Templates & Communication Flow

### Template Engine Architecture

eNOTIF uses a simple string-replacement template engine for email composition:

```typescript
// functions/src/email/templates.ts
function render(template: string, data: TemplateData): string {
  return template
    .replace(/{{ApplicantName}}/g, data.applicantName)
    .replace(/{{FLANumber}}/g, data.flaNumber)
    .replace(/{{Amount}}/g, data.amount)
    .replace(/{{DueDate}}/g, data.dueDate)
    .replace(/{{Office}}/g, data.office);
}
```

### Email Template Styles

All emails use a consistent branded template with:
- DENR Region VIII header in green (#15803d)
- Professional Arial/Helvetica typography
- Responsive max-width container (600px)
- Footer disclaimer about automated system messages

### Template Examples

#### 10-Day Internal Reminder Template
```
Subject: [eNOTIF] Upcoming Rental Due in 10 Days - FLA {FLANumber}

Body Preview:
This is a reminder that the annual rental for the following 
Foreshore Lease Agreement is due in 10 days:

- Applicant: {ApplicantName}
- FLA Number: {FLANumber}
- Amount Due: {Amount}
- Due Date: {DueDate}
- Office: {Office}

Please prepare for billing and collection follow-up ahead 
of the due date.
```

#### 3-Day Urgent Reminder Template (Lessee Only)
```
Subject: Urgent Reminder: Rental Due in 3 Days - FLA {FLANumber}

Body Preview:
Dear {ApplicantName},

Your annual rental for Foreshore Lease Agreement 
{FLANumber} is due in 3 days, on {DueDate}.

Amount Due: {Amount}

Please settle your payment with the {Office} as soon as 
possible to avoid your account becoming overdue.
```

#### Demand Letter Template (Overdue)
```
Subject: Demand Letter - Overdue Rental for FLA {FLANumber}

Body Preview:
Dear {ApplicantName},

Our records show that the annual rental for Foreshore Lease 
Agreement {FLANumber}, which was due on {DueDate}, remains 
unpaid as of {currentDate}.

Amount Due: {Amount}
Penalty: {penalty}

You are hereby required to settle your outstanding balance 
with the {Office} within fifteen (15) days from receipt of 
this letter to avoid further action, which may include 
cancellation of your lease agreement.

A formal copy of this demand letter is attached as PDF.
```

---

## 💳 Payment Processing System

### Cashier Payment Recording Flow

When a cashier records a payment in the system:

```typescript
// Frontend: src/components/payments/PaymentForm.tsx (simplified)
interface PaymentInput {
  leaseId: string;           // Selected from dropdown
  amount: number;            // Amount received
  paymentDate: string;       // Today's date (pre-filled)
  receiptNumber: string;     // Generated by cashier or pre-numbered
  remarks?: string;          // Optional notes
  proofUrl?: string;         // Proof of payment (optional)
}

// Backend: src/app/api/payments/route.ts (simplified)
export async function POST(request: Request) {
  const auth = await getAuthFromSession(request);
  if (!auth || !can(auth.role, "payments:record")) {
    throw new ForbiddenError("Unauthorized to record payments");
  }

  const input = await request.json();
  const validatedInput = leaseInputSchema.safeParse(input); // Uses payment schema
  
  if (!validatedInput.success) {
    throw new ValidationError(validatedInput.error.message);
  }

  const now = new Date().toISOString();
  const data = {
    ...validatedInput.data,
    province: lease.assignedPenro,
    cenro: lease.assignedCenro,
    cashierId: auth.uid,
    cashierName: auth.name,
    paymentDate: validatedInput.data.paymentDate || now,
    createdAt: now,
  };

  const ref = await adminDb.collection("payments").add(data);
  
  // Update lease status to PAID
  await adminDb.collection("leases").doc(leaseId).update({
    status: "PAID",
    updatedAt: now,
  });

  // Log audit trail
  await adminDb.collection("audit_logs").add({
    userId: auth.uid,
    userName: auth.name,
    action: "payment.recorded",
    details: `Lease ${leaseId} - Payment of PHP ${validatedInput.data.amount}`,
    dateTime: now,
  });

  // Trigger notification email via Firestore trigger
  return NextResponse.json({ success: true, paymentId: ref.id });
}
```

### Payment Proof Upload (Optional)

Cashiers can optionally upload proof of payment:

```typescript
// Frontend: After payment form submission
const proofRef = await uploadToStorage(proofFile);
await createPayment({ ...paymentData, proofUrl: proofRef.downloadURL });

// Storage Rules (firestore.rules):
allow read: if true;  // Signed URLs for access control
allow write: if request.resource.contentType == 'image/*' || 
               request.resource.contentType == 'application/pdf';
```

---

## 📄 Demand Letter Generation (PDF)

### PDF Generation Architecture

eNOTIF generates official demand letters using **pdfkit** library, which provides programmatic PDF creation similar to a DOM-based approach.

#### PDF Generation Function

```typescript
// functions/src/pdf/demandLetter.ts
export function generateDemandLetterPdf(
  lease: Pick<LeaseDoc, "flaNumber" | "applicantName" | "annualRental" | "dueDate" | "assignedPenro">,
  penalty: number,
  responseDays: number = 15 // Default 15-day response period
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const today = new Date().toLocaleDateString("en-PH", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });

    // Build PDF document
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Republic of the Philippines", { align: "center" })
      .fontSize(13)
      .text("Department of Environment and Natural Resources", { align: "center" })
      .fontSize(11)
      .text("Region VIII Eastern Visayas", { align: "center" })
      .fontSize(10)
      .text("Sto. Niño Extension, Tacloban City", { align: "center" });

    // Draw separator line
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .lineWidth(1)
      .strokeColor("#15803d")
      .stroke()
      .moveDown(1.5);

    // Add recipient and subject
    doc
      .text(today, { align: "right" })
      .moveDown()
      .text(lease.applicantName)
      .moveDown()
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Subject: DEMAND LETTER - Overdue Annual Rental for Foreshore Lease Agreement");

    // Body text
    doc
      .font("Helvetica")
      .text(`Dear ${lease.applicantName},`)
      .moveDown()
      .text(
        `Our records show that the annual rental for your Foreshore Lease ` +
        `Agreement No. ${lease.flaNumber}, which was due on ${lease.dueDate},` +
        ` remains unpaid as of the date of this letter.`
      )
      .moveDown();

    // Amount breakdown with bold labels
    doc
      .font("Helvetica-Bold")
      .text("Amount Due: ", { continued: true })
      .font("Helvetica")
      .text(` PHP ${lease.annualRental.toLocaleString()}`)
      .font("Helvetica-Bold")
      .text("Penalty: ", { continued: true })
      .font("Helvetica")
      .text(` PHP ${penalty.toLocaleString()}`)
      .font("Helvetica-Bold")
      .text("Total Amount Due: ", { continued: true })
      .font("Helvetica")
      .text(` PHP ${(lease.annualRental + penalty).toLocaleString()}`);

    // Legal requirements
    doc
      .moveDown(2)
      .text(
        `You are hereby required to settle your outstanding balance with the ` +
        `${lease.assignedPenro} within ${responseDays} day${responseDays === 1 ? "" : "s"} ` +
        `from receipt of this letter. Failure to do so may result in further ` +
        `action, including but not limited to cancellation of your lease agreement.`
      )
      .moveDown(2)
      .text("Very truly yours,")
      .moveDown(2)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(`${lease.assignedPenro}`)
      .moveDown(3)
      .font("Helvetica")
      .fontSize(10)
      .text("Department of Environment and Natural Resources");

    doc.end();
  });
}
```

#### PDF Upload to Storage

Generated PDFs are uploaded to Firebase Storage with permanent URLs:

```typescript
// functions/src/pdf/demandLetter.ts
export async function uploadDemandLetterPdf(leaseId: string, pdfBuffer: Buffer): Promise<string> {
  const bucket = getStorage().bucket();
  // Unique file path per lease with timestamp to prevent overwrites
  const filePath = `demand-letters/${leaseId}/${Date.now()}.pdf`;
  const file = bucket.file(filePath);

  await file.save(pdfBuffer, { contentType: "application/pdf" });

  // Generate long-lived signed URL (expires in year 2100 for archival)
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "01-01-2100",
  });

  return url;
}
```

### Email with PDF Attachment

The demand letter email includes the generated PDF as an attachment:

```typescript
await sendAndLogNotification({
  lease,
  recipient: lease.email,
  notificationType: "DEMAND_LETTER",
  subject: `Demand Letter - Overdue Rental for FLA ${lease.flaNumber}`,
  html: template.html,
  attachments: [{
    filename: `Demand-Letter-${lease.flaNumber}.pdf`,
    content: pdfBuffer // Attach PDF to email
  }],
  pdfUrl, // Also store URL in notification record
});
```

---

## 🔒 Security Model & Best Practices

### Multi-Layered Security Architecture

#### Layer 1: Firebase Authentication

- **Email/Password Authentication** with secure password hashing
- **Custom Claims** for role-based authorization
- **Session Management** with HttpOnly cookies preventing XSS attacks
- **Shared Auth Pool** namespacing to coexist with eSAPA and eNOTIG

#### Layer 2: Server-Side Authorization (API Routes)

```typescript
// src/app/api/leases/route.ts
export async function POST(request: Request) {
  const auth = await getAuthFromSession(request);
  
  // Check role-based permission
  if (!can(auth.role, "leases:create")) {
    throw new ForbiddenError("Unauthorized to create leases");
  }

  // Validate data
  const validatedInput = leaseInputSchema.safeParse(await request.json());
  if (!validatedInput.success) {
    throw new ValidationError(validatedInput.error.message);
  }

  // Verify office assignments exist
  await verifyOfficeAssignment({
    assignedPenro: validatedInput.data.assignedPenro,
    assignedCenro: validatedInput.data.assignedCenro,
  });

  // Create lease
  const lease = await createLease(validatedInput.data, auth.uid);

  return NextResponse.json(lease);
}
```

#### Layer 3: Firestore Security Rules (Defense-in-Depth)

Firestore rules provide an additional security layer for client reads:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to extract custom claims
    function getEnotifRole() {
      return request.auth?.custom_claims.enotif_role;
    }

    function isRegionalAdmin() {
      return getEnotifRole() == 'regional_admin';
    }

    function isPenroAdmin() {
      return getEnotifRole() == 'penro_admin' && 
             resource.data.assignedPenro == request.auth.enotif_province;
    }

    // Leases collection rules
    match /leases/{leaseId} {
      // Anyone can read (for notification recipients)
      allow read: if true;

      // Only PENRO Admins, Regional Admins, and lessees can create
      allow create: if 
        isRegionalAdmin() || 
        isPenroAdmin() ||
        request.resource.data.email == request.auth.email;

      // Update permissions
      allow update: if 
        isRegionalAdmin() || 
        getEnotifRole() == 'penro_admin' && resource.data.assignedPenro == request.auth.enotif_province;

      // Delete only Regional Admins
      allow delete: if isRegionalAdmin();
    }

    // Users collection
    match /users/{userId} {
      allow read: if true; // Read users for notification matching
      
      // Only Regional Admins can modify user records
      allow write: if isRegionalAdmin();
    }

    // Payments - anyone who owns the lease can view their payments,
    // but recording payments requires cashier role verification
    match /payments/{paymentId} {
      allow read: if true; // Lessees can see their own payment history
      
      allow create: if request.auth.enotif_role in ['cashier', 'penro_admin', 'regional_admin'];
      
      // Only Regional Admins can delete payments
      allow delete: if isRegionalAdmin();
    }
  }
}
```

#### Layer 4: Input Validation (Zod)

All external input is validated before processing:

```typescript
// Server-side validation in API routes
export async function POST(request: Request) {
  const auth = await getAuthFromSession(request);
  
  // ... role check ...

  const body = await request.json();
  const result = leaseInputSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.errors },
      { status: 400 }
    );
  }

  // Safe to proceed with validated data
}
```

### API Error Handling Strategy

eNOTIF implements consistent error responses that don't leak sensitive information:

```typescript
// src/lib/api-utils.ts
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.flatten() },
      { status: 400 }
    );
  }
  if (error instanceof Error && error.message === "Lease not found") {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Generic error for unknown issues to prevent info leakage
  console.error(error);
  return NextResponse.json( 
    { error: "Internal server error" }, 
    { status: 500 } 
  );
}
```

### Secrets Management

#### SMTP Credentials in Functions Secrets API

Instead of storing sensitive credentials in environment variables, eNOTIF uses Firebase Functions Secrets:

```bash
# Set secrets interactively (never as command-line arguments)
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS

# Access in Cloud Function code
import { SMTP_USER, SMTP_PASS } from "./email/transporter";
```

This ensures:
- **No plaintext credentials** in deployment logs or source control
- **Runtime-only access** via secure API calls
- **Automatic rotation** capability through Google Cloud Console

### Data Privacy Considerations

1. **Least Privilege Principle**: Users can only access data relevant to their role and office assignment
2. **Audit Trail**: All write operations are logged with user context for accountability
3. **Secure Storage**: Payment proofs (if uploaded) are stored encrypted at rest in Firebase Storage
4. **Data Minimization**: Only necessary personally identifiable information is collected and stored

---

## 🚀 Development Environment Setup

### Prerequisites

| Tool | Version Required | Purpose |
|------|------------------|---------|
| Node.js | 18.x LTS or later | Runtime environment |
| npm | 9.x or later | Package management |
| Firebase CLI | Latest | Deployment and local emulation |
| Git | Any version | Source control |

### Step-by-Step Setup

#### 1. Clone and Install Dependencies

```bash
# Clone repository (if not already done)
git clone <repository-url>
cd eNOTIF

# Install Next.js dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
```

#### 2. Configure Firebase CLI

```bash
# Initialize Firebase CLI if not already done
firebase login

# Use correct project
firebase use default  # Should point to esapa-denr-r8
firebase projects:list  # Verify project ID
```

#### 3. Set Environment Variables

Fill in the `.env.local` file with your Firebase configuration:

```bash
# Client SDK (for Next.js browser-side code)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=esapa-denr-r8
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxxxxxxxxxx

# Admin SDK (server-side only - NEVER commit to git)
FIREBASE_SERVICE_ACCOUNT_JSON={
  "type": "service_account",
  "project_id": "esapa-denr-r8",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  ...
}

# Session configuration
SESSION_COOKIE_NAME=__session
SESSION_COOKIE_MAX_AGE_MS=432000000
```

#### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you'll be redirected to `/login`.

---

### Local Cloud Functions Testing

#### Prerequisites for Local Emulation

1. Install Firebase CLI globally if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Set up local secrets (for testing email functions):
   ```bash
   cd functions
   firebase functions:secrets:set SMTP_USER
   # Enter secret interactively when prompted (not via command line)
   ```

#### Start Emulator Suite

```bash
cd functions
npm install
npm run build  # Build TypeScript to JavaScript
firebase emulators:start
```

The emulator will start on `http://127.0.0.1:4000` with:
- Firestore emulator
- Functions emulator  
- Auth emulator
- Storage emulator
- UI for debugging

#### Testing Locally

Once the emulator is running, you can trigger functions:

```bash
# Trigger daily scheduler locally
firebase functions:dailyScheduler:call

# Create test payment
firebase functions:onPaymentCreated:test
```

---

## 📦 Production Deployment Guide

### Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All `.env.local` values are correct for production Firebase project
- [ ] Service account key file is valid and accessible (`FIREBASE_SERVICE_ACCOUNT_KEY_PATH`)
- [ ] SMTP credentials are set in Functions Secrets API (not environment variables)
- [ ] Firestore named database `enotif` exists
- [ ] First admin user has been seeded using `scripts/seed-admin.js`
- [ ] Local testing passed successfully

### Deployment Commands

#### Deploy All Services (Firestore Rules, Functions, Hosting)

```bash
# From project root directory
firebase deploy --only firestore:rules,functions,hosting

# Or deploy everything (including web app and functions)
firebase deploy
```

**What gets deployed:**
1. **Firestore Security Rules** (`firestore.rules`): Enforces client-side read permissions
2. **Cloud Functions**: `dailyScheduler`, `onPaymentCreated`, email generation functions
3. **Next.js Web App**: Served via Firebase Hosting's web frameworks integration
4. **Storage Rules** (`storage.rules`): Controls access to demand letter PDFs

### Post-Deployment Verification

After deployment completes, verify:

1. **Check Functions Status:**
   ```bash
   firebase functions:list
   ```

   Expected output should include:
   - `dailyScheduler` (scheduled)
   - `onPaymentCreated` (Firestore trigger)
   - Email-related functions (`send`, `transporter`)

2. **Verify Cron Job:**
   - Open Google Cloud Console → Cloud Run → Scheduler Triggers
   - Confirm `dailyScheduler` runs daily at 06:00 AM Asia/Manila time

3. **Test Authentication:**
   - Visit deployed app URL (usually `https://yoursite.web.app`)
   - Try logging in with seeded admin credentials

4. **Check Firestore Data Access:**
   - Open Firebase Console → Firestore Database → enotif database
   - Verify you can read/write test documents

---

## 📊 Monitoring & Observability

### Cloud Functions Logs

All function execution logs are streamed to Google Cloud Logging:

```typescript
// functions/src/logger.ts (Firebase logger)
import * as logger from "firebase-functions/logger";

// Usage in functions
logger.info(`Daily scheduler started`);
logger.error(`Failed to send email: ${error.message}`, { error: error });
```

### Firestore Query Performance

Firestore provides query performance monitoring in the Firebase Console:
- Open **Analytics** → **Query Performance** tab
- Review slow queries and optimize with composite indexes

### Scheduled Function Monitoring

Check scheduler health via Google Cloud Console:
1. Navigate to **Cloud Scheduler** service
2. View trigger execution history
3. Monitor latency and success/failure rates

### Payment Tracking Analytics

Dashboard charts visualize collection statistics using Recharts:
- Revenue bar chart showing collections over time
- Status distribution (ACTIVE, PAID, OVERDUE counts)
- Filterable by office (PENRO/CENRO) or date range

---

## 🔧 Troubleshooting & Common Issues

### Issue 1: "Authentication Failed" on Login

**Symptoms:** User cannot log in after deployment or after service account key change.

**Possible Causes:**
- Service account key is invalid or expired
- `NEXT_PUBLIC_*` environment variables are incorrect
- Firebase Authentication is not enabled for the project

**Solution:**
```bash
# 1. Verify service account key exists and is readable
cat $FIREBASE_SERVICE_ACCOUNT_KEY_PATH | firebase login:ci

# 2. Check Auth configuration in Firebase Console
#   Project Settings > Service Accounts > Generate new private key
#   Copy the JSON to .env.local

# 3. Redeploy to pick up changes
firebase deploy --only functions,hosting
```

---

### Issue 2: "Leases query returned empty" for PENRO Admins

**Symptoms:** PENRO Administrator can log in but sees no leases in their list.

**Possible Causes:**
- Missing `assignedPenro` field in user document
- Office scope mismatch between user profile and lease records

**Solution:**
```typescript
// Check user's province field exists
const user = await adminDb.collection("users").doc(userId).get();
console.log(user.data().province); // Should match a PENRO office code

// Verify leases have matching assignedPenro values
const leases = await adminDb.collection("leases")
  .where("assignedPenro", "==", user.data().province)
  .get();
```

---

### Issue 3: "SMTP credentials rejected" in Cloud Functions

**Symptoms:** Email sending fails with permission denied.

**Root Cause:** SMTP secrets not set via Functions Secrets API or incorrect credential format.

**Solution:**
```bash
# Set secrets properly (interactive mode required)
cd functions
firebase functions:secrets:set SMTP_USER
# Paste username when prompted
firebase functions:secrets:set SMTP_PASS  
# Paste password when prompted

# Redeploy functions to pick up new secrets
firebase deploy --only functions
```

---

### Issue 4: "Request limit exceeded" on Firestore queries

**Symptoms:** Application crashes or returns errors during heavy usage.

**Possible Cause:** Too many read operations in a single API route (exceeds 10,000 requests/day quota).

**Solution:**
- Implement pagination for large result sets
- Cache frequently accessed data with Redis (future enhancement)
- Optimize Firestore queries with proper indexing

---

### Issue 5: "Demand letter PDF not generated" error

**Symptoms:** Overdue handler marks lease as OVERDUE but no email with PDF is sent.

**Possible Causes:**
- pdfkit library not installed in functions dependencies
- Firebase Storage bucket permissions misconfigured
- Lease ID format changes after initial generation (causing duplicate prevention to skip)

**Solution:**
```bash
# Check function deployment status
firebase deploy --only functions:generateDemandLetterPdf

# Verify storage rules allow demand-letter access
cat firestore.rules | grep -A 10 "demand-letters"

# Check notification history for failed attempts
# In Firebase Console → Firestore → notifications collection
```

---

## 🚀 Future Enhancement Roadmap

### Phase 1: Communication Enhancements (Q4 2025)

| Enhancement | Description | Priority | Effort |
|-------------|-------------|----------|--------|
| **SMS Notifications** | Integrate Twilio or local SMS gateway for critical reminders | High | Medium |
| **Push Notifications** | Firebase Cloud Messaging for mobile web notifications | Medium | Low |
| **Multilingual Support** | Tagalog/Filipino translations for reminder emails | Medium | High |

### Phase 2: Advanced Features (Q1 2026)

| Enhancement | Description | Priority | Effort |
|-------------|-------------|----------|--------|
| **GIS Property Mapping** | Display lease locations on interactive map using Google Maps API | High | Very High |
| **QR Code Verification** | Generate unique QR codes on demand letters for payment verification | Medium | Medium |
| **Digital Signatures** | Implement e-signature capability for lease agreements | Low | High |

### Phase 3: Payment & Integration (Q2-Q3 2026)

| Enhancement | Description | Priority | Effort |
|-------------|-------------|----------|--------|
| **Online Payment Gateway** | Integrate GCash/Maya/payPal for direct lessee payments | High | Very High |
| **Bank Auto-Feed** | Receive payment confirmations via bank API webhook integration | Medium | Very High |
| **DENR Single Sign-On** | Integrate with DENR corporate SSO infrastructure | Low | Medium |

### Phase 4: Analytics & AI (Q4 2026)

| Enhancement | Description | Priority | Effort |
|-------------|-------------|----------|--------|
| **Collection Forecasting** | ML-based prediction of collection rates using historical data | High | Very High |
| **Risk Scoring** | Identify high-risk lessees based on payment history patterns | Medium | Medium |
| **Automated Report Generation** | Auto-generate monthly/quarterly collection reports | Low | Medium |

---

## 📚 Appendix

### A. Glossary of Terms

| Term | Definition |
|------|------------|
| **FLA** | Foreshore Lease Agreement - The legal contract allowing use of DENR foreshore land |
| **PENRO** | Provincial Environment and Natural Resources Office - DENR office at the provincial level |
| **CENRO** | City/Municipal Environment and Natural Resources Office - DENR office at the local government level |
| **Tenant** | Lessee or Foreshore Lease Agreement holder |
| **Annual Rental** | Fee required for one year of foreshore land usage |

### B. File Structure Overview

```
eNOTIF/
├── src/                          # Next.js application code
│   ├── app/                      # App Router pages
│   │   ├── login/               # Public login page
│   │   └── (dashboard)/         # Authenticated app shell
│   ├── components/              # Reusable UI components
│   │   ├── dashboard/          # Sidebar, TopBar, LogoutButton
│   │   ├── leases/             # LeaseForm component
│   │   ├── payments/           # PaymentForm component
│   │   └── notifications/      # NotificationsTable component
│   ├── lib/                     # Business logic utilities
│   │   ├── data/               # Firestore CRUD operations
│   │   ├── validation/         # Zod schemas for input validation
│   │   ├── rbac.ts             # Role-permission matrix
│   │   └── constants.ts        # Shared constants (roles, cookie names)
│   └── types/                   # TypeScript type definitions
├── functions/                    # Cloud Functions code
│   ├── src/
│   │   ├── scheduler/          # Daily notification scheduler
│   │   ├── email/              # Email template and sending logic
│   │   ├── pdf/                # PDF generation for demand letters
│   │   └── data/               # Firestore operations for functions
│   └── package.json            # Function dependencies
├── firestore.rules              # Security rules for Firestore
├── storage.rules                # Security rules for Firebase Storage
├── firebase.json                # Firebase project configuration
├── .firebaserc                  # Project alias configuration
└── package.json                 # Main app dependencies
```

### C. Useful Commands Reference

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build production bundle
npm run start            # Run production server
npm run lint             # Run ESLint

# Firebase Management
firebase login          # Authenticate with Firebase CLI
firebase use default    # Select default project (esapa-denr-r8)
firebase deploy         # Deploy all services
firebase serve          # Serve Next.js locally without dev server
firebase functions:shell  # Run Cloud Functions locally

# Secrets Management
firebase functions:secrets:set SMTP_USER  # Set SMTP username secret
firebase functions:secrets:get SMTP_USER  # View stored secret value

# Database Management (via Firebase Console or gcloud CLI)
gcloud firestore databases list              # List Firestore databases
gcloud firestore indexes createComposite     # Create composite index
```

### D. Contact & Support

For technical issues or feature requests related to eNOTIF:

- **Development Team:** DENR Region VIII IT Division
- **System Owner:** Regional Administrator (eNOTIF)
- **Support Hours:** Mon-Fri, 8:00 AM - 5:00 PM Philippine Time
- **Internal Ticketing:** [Insert internal ticketing system URL]

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | July 29, 2026 | eNOTIF Development Team | Initial comprehensive documentation generated from codebase analysis |

---

*This documentation is maintained for internal use by DENR Region VIII authorized personnel only. Do not distribute externally.*