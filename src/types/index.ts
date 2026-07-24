// Core domain types shared across the eNOTIF application.

export type UserRole =
  | "regional_admin"
  | "penro_admin"
  | "cenro_personnel"
  | "cashier";

export type UserStatus = "active" | "disabled";

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** PENRO office/province the user belongs to. Omitted for regional_admin. */
  province?: string;
  /** CENRO office the user belongs to. Only set for cenro_personnel. */
  cenro?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type LeaseType = "residential" | "commercial" | "industrial";

export type LeaseStatus =
  | "ACTIVE"
  | "FOR PAYMENT"
  | "PAID"
  | "OVERDUE"
  | "EXPIRED";

export interface LeaseDoc {
  id: string;
  flaNumber: string;
  applicantName: string;
  email: string;
  contactNumber: string;
  mailingAddress: string;
  municipality: string;
  barangay: string;
  coordinates?: { lat: number; lng: number };
  leaseType: LeaseType;
  area: number;
  annualRental: number;
  billingDate: string;
  dueDate: string;
  leaseStartDate: string;
  expirationDate: string;
  assignedPenro: string;
  assignedCenro: string;
  status: LeaseStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PaymentDoc {
  id: string;
  leaseId: string;
  flaNumber: string;
  province: string;
  cenro: string;
  amount: number;
  paymentDate: string;
  receiptNumber: string;
  cashierId: string;
  cashierName: string;
  remarks?: string;
  proofUrl?: string;
  createdAt: string;
}

export type NotificationType =
  | "UPCOMING_BILLING"
  | "10_DAY_REMINDER"
  | "3_DAY_REMINDER"
  | "PAYMENT_CONFIRMATION"
  | "DEMAND_LETTER";

export type NotificationStatus = "SENT" | "FAILED";

export interface NotificationDoc {
  id: string;
  leaseId: string;
  flaNumber: string;
  province: string;
  cenro: string;
  recipient: string;
  notificationType: NotificationType;
  sentDate: string;
  status: NotificationStatus;
  error?: string;
}

export interface DemandLetterDoc {
  id: string;
  leaseId: string;
  flaNumber: string;
  province: string;
  cenro: string;
  generatedDate: string;
  pdfUrl: string;
  emailStatus: NotificationStatus;
}

export interface AuditLogDoc {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  dateTime: string;
}

export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  province?: string;
  cenro?: string;
}
