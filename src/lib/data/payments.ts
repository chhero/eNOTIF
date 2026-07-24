import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import { REGIONAL_ADMIN, PENRO_ADMIN, CENRO_PERSONNEL, CASHIER } from "@/lib/constants";
import type { PaymentDoc, SessionUser } from "@/types";
import type { PaymentInput } from "@/lib/validation/payment";
import { getLeaseById } from "@/lib/data/leases";
import { writeAuditLog } from "@/lib/data/audit";

const COLLECTION = "payments";

function paymentFromSnap(id: string, data: FirebaseFirestore.DocumentData): PaymentDoc {
  return { id, ...data } as PaymentDoc;
}

export async function listPaymentsForUser(user: SessionUser): Promise<PaymentDoc[]> {
  let query: FirebaseFirestore.Query = adminDb.collection(COLLECTION);

  if (user.role === PENRO_ADMIN || user.role === CASHIER) {
    if (!user.province) return [];
    query = query.where("province", "==", user.province);
  } else if (user.role === CENRO_PERSONNEL) {
    if (!user.cenro) return [];
    query = query.where("cenro", "==", user.cenro);
  } else if (user.role !== REGIONAL_ADMIN) {
    return [];
  }

  const snap = await query.orderBy("paymentDate", "desc").limit(200).get();
  return snap.docs.map((d) => paymentFromSnap(d.id, d.data()));
}

export async function listPaymentsForLease(leaseId: string): Promise<PaymentDoc[]> {
  const snap = await adminDb
    .collection(COLLECTION)
    .where("leaseId", "==", leaseId)
    .orderBy("paymentDate", "desc")
    .get();
  return snap.docs.map((d) => paymentFromSnap(d.id, d.data()));
}

/**
 * Records a payment for a lease, then marks the lease PAID, stops further
 * reminders (handled implicitly since the scheduler skips PAID leases), and
 * writes an audit log entry. Mirrors the plan's "After payment" rules.
 */
export async function recordPayment(
  input: PaymentInput,
  cashier: SessionUser
): Promise<PaymentDoc> {
  const lease = await getLeaseById(input.leaseId);
  if (!lease) {
    throw new Error("Lease not found");
  }

  const now = new Date().toISOString();
  const data: Omit<PaymentDoc, "id"> = {
    leaseId: lease.id,
    flaNumber: lease.flaNumber,
    province: lease.assignedPenro,
    cenro: lease.assignedCenro,
    amount: input.amount,
    paymentDate: input.paymentDate,
    receiptNumber: input.receiptNumber,
    cashierId: cashier.uid,
    cashierName: cashier.name,
    remarks: input.remarks,
    proofUrl: input.proofUrl,
    createdAt: now,
  };

  const ref = await adminDb.collection(COLLECTION).add(data);

  await adminDb.collection("leases").doc(lease.id).update({
    status: "PAID",
    updatedAt: now,
  });

  await writeAuditLog(
    cashier,
    "PAYMENT_RECORDED",
    `Recorded payment of ${input.amount} for FLA ${lease.flaNumber} (receipt ${input.receiptNumber})`
  );

  return { id: ref.id, ...data };
}
