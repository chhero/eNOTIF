import { z } from "zod";
import { OFFICE_HIERARCHY } from "@/lib/constants";
import type { UserRole } from "@/types";

const roleValues: [UserRole, ...UserRole[]] = [
  "regional_admin",
  "penro_admin",
  "cenro_personnel",
  "cashier",
];
const penroValues = Object.keys(OFFICE_HIERARCHY) as [string, ...string[]];

export const userInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(150),
    email: z.string().trim().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(roleValues),
    province: z.enum(penroValues).optional(),
    cenro: z.string().trim().optional(),
  })
  .refine((data) => data.role === "regional_admin" || !!data.province, {
    message: "Province/PENRO office is required for this role",
    path: ["province"],
  })
  .refine(
    (data) =>
      data.role !== "cenro_personnel" ||
      (!!data.province && (OFFICE_HIERARCHY[data.province] ?? []).includes(data.cenro ?? "")),
    { message: "CENRO office must belong to the selected PENRO", path: ["cenro"] }
  );

export type UserInput = z.infer<typeof userInputSchema>;
