import { z } from "zod";
import type { UserRole } from "@/types";

const roleValues: [UserRole, ...UserRole[]] = [
  "regional_admin",
  "penro_admin",
  "cenro_personnel",
  "cashier",
];

// Note: province/cenro are validated against the actual Firestore
// PENRO/CENRO records (see verifyOfficeAssignment in
// src/lib/data/offices.ts), not a hardcoded list, since offices are managed
// dynamically via the PENRO/CENRO Management pages.
export const userInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(150),
    email: z.string().trim().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(roleValues),
    province: z.string().trim().min(1).optional(),
    cenro: z.string().trim().optional(),
  })
  .refine((data) => data.role === "regional_admin" || !!data.province, {
    message: "Province/PENRO office is required for this role",
    path: ["province"],
  })
  .refine((data) => data.role !== "cenro_personnel" || !!data.cenro, {
    message: "CENRO office is required for this role",
    path: ["cenro"],
  });

export type UserInput = z.infer<typeof userInputSchema>;
