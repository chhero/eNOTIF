export type LeaseStatus = "ACTIVE" | "FOR PAYMENT" | "PAID" | "OVERDUE" | "EXPIRED";

export interface LeaseDoc {
  id: string;
  flaNumber: string;
  applicantName: string;
  email: string;
  annualRental: number;
  dueDate: string; // ISO date (YYYY-MM-DD)
  assignedPenro: string;
  assignedCenro: string;
  status: LeaseStatus;
}

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  role: "regional_admin" | "penro_admin" | "cenro_personnel" | "cashier";
  province?: string;
  cenro?: string;
  status: "active" | "disabled";
}
