import type { LeaseStatus, LeaseType, UserRole } from "@/types";

export const REGIONAL_ADMIN: UserRole = "regional_admin";
export const PENRO_ADMIN: UserRole = "penro_admin";
export const CENRO_PERSONNEL: UserRole = "cenro_personnel";
export const CASHIER: UserRole = "cashier";

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: REGIONAL_ADMIN, label: "Regional Administrator" },
  { value: PENRO_ADMIN, label: "PENRO Administrator" },
  { value: CENRO_PERSONNEL, label: "CENRO Personnel" },
  { value: CASHIER, label: "Cashier" },
];

export const LEASE_STATUSES: LeaseStatus[] = [
  "ACTIVE",
  "FOR PAYMENT",
  "PAID",
  "OVERDUE",
  "EXPIRED",
];

export const LEASE_TYPES: { value: LeaseType; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

export const STATUS_BADGE_CLASSES: Record<LeaseStatus, string> = {
  ACTIVE: "bg-blue-100 text-blue-800",
  "FOR PAYMENT": "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  EXPIRED: "bg-gray-200 text-gray-700",
};

// DENR Region VIII organizational hierarchy: PENRO -> CENRO offices.
export const OFFICE_HIERARCHY: Record<string, string[]> = {
  "PENRO Samar": ["CENRO 1", "CENRO 2"],
  "PENRO Ormoc": ["CENRO Ormoc"],
  "PENRO Southern Leyte": ["CENRO Southern Leyte"],
  "PENRO Biliran": ["CENRO Biliran"],
};

export const PENRO_OFFICES = Object.keys(OFFICE_HIERARCHY);

export const REMINDER_DAYS_BEFORE_DUE = 10;
export const DEMAND_LETTER_DAYS_BEFORE_DUE = 3;

// MUST be named "__session" — Firebase Hosting strips all cookies from
// incoming requests to Cloud Functions/Cloud Run EXCEPT one literally named
// "__session" (see https://firebase.google.com/docs/hosting/manage-cache#using_cookies).
// Any other name is silently stripped, causing every page load after login to
// appear signed-out even though the cookie was set correctly.
export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "__session";
export const SESSION_COOKIE_MAX_AGE_MS = Number(
  process.env.SESSION_COOKIE_MAX_AGE_MS ?? 5 * 24 * 60 * 60 * 1000
);
