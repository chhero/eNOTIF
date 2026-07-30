import type { UserRole } from "@/types";
import {
  REGIONAL_ADMIN,
  PENRO_ADMIN,
  CENRO_PERSONNEL,
  CASHIER,
} from "@/lib/constants";

// Role-based access control permission matrix.
// This is the server-side source of truth used by API routes. It mirrors
// (but does not replace) the Firestore security rules, which act as a
// defense-in-depth backstop for direct client reads.

export type Permission =
  | "leases:create"
  | "leases:edit"
  | "leases:delete"
  | "leases:view"
  | "payments:record"
  | "payments:view"
  | "users:manage"
  | "users:view"
  | "cenro:manage"
  | "penro:manage"
  | "reports:generate"
  | "audit:view"
  | "system:configure";

const PERMISSIONS: Record<UserRole, Permission[]> = {
  regional_admin: [
    "leases:create",
    "leases:edit",
    "leases:delete",
    "leases:view",
    "payments:record",
    "payments:view",
    "users:manage",
    "users:view",
    "cenro:manage",
    "penro:manage",
    "reports:generate",
    "audit:view",
    "system:configure",
  ],
  penro_admin: [
    "leases:edit",
    "leases:view",
    "payments:view",
    "users:view",
    "reports:generate",
  ],
  cenro_personnel: [
    "leases:create",
    "leases:view",
    "users:view",
    "reports:generate",
  ],
  cashier: ["leases:view", "payments:record", "payments:view", "users:view"],
};

export function can(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Returns true if the user's office scope grants access to a lease with the given province/cenro. */
export function isWithinScope(
  user: { role: UserRole; province?: string; cenro?: string },
  lease: { assignedPenro?: string; assignedCenro?: string }
): boolean {
  if (user.role === REGIONAL_ADMIN) return true;
  if (user.role === PENRO_ADMIN || user.role === CASHIER) {
    return user.province === lease.assignedPenro;
  }
  if (user.role === CENRO_PERSONNEL) {
    return user.cenro === lease.assignedCenro;
  }
  return false;
}
