import { z } from "zod";
import type { LeaseType } from "@/types";

const leaseTypeValues: [LeaseType, ...LeaseType[]] = [
  "residential",
  "commercial",
  "industrial",
];

// Note: assignedPenro/assignedCenro are validated against the actual
// Firestore PENRO/CENRO records (see verifyOfficeAssignment in
// src/lib/data/offices.ts), not a hardcoded list, since offices are managed
// dynamically via the PENRO/CENRO Management pages.
export const leaseInputSchema = z.object({
  flaNumber: z.string().trim().min(1, "FLA number is required").max(50),
  applicantName: z.string().trim().min(1, "Applicant name is required").max(200),
  email: z.string().trim().email("Valid email is required"),
  contactNumber: z.string().trim().min(1, "Contact number is required").max(30),
  mailingAddress: z.string().trim().min(1, "Mailing address is required").max(300),
  municipality: z.string().trim().min(1).max(100),
  barangay: z.string().trim().min(1).max(100),
  coordinates: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
  leaseType: z.enum(leaseTypeValues),
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
