import { z } from "zod";

export const paymentInputSchema = z.object({
  leaseId: z.string().trim().min(1, "Lease is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  receiptNumber: z.string().trim().min(1, "Receipt number is required").max(50),
  remarks: z.string().trim().max(500).optional(),
  proofUrl: z.string().trim().url().optional(),
});

export type PaymentInput = z.infer<typeof paymentInputSchema>;
