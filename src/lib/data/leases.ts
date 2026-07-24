import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import { REGIONAL_ADMIN, PENRO_ADMIN, CENRO_PERSONNEL, CASHIER } from "@/lib/constants";
import type { LeaseDoc, SessionUser } from "@/types";
import type { LeaseInput } from "@/lib/validation/lease";

const COLLECTION = "leases";

function leaseFromSnap(id: string, data: FirebaseFirestore.DocumentData): LeaseDoc {
  return { id, ...data } as LeaseDoc;
}

/** Lists leases visible to the given user, scoped by their office assignment. */
export async function listLeasesForUser(user: SessionUser): Promise<LeaseDoc[]> {
  let query: FirebaseFirestore.Query = adminDb.collection(COLLECTION);

  if (user.role === PENRO_ADMIN || user.role === CASHIER) {
    if (!user.province) return [];
    query = query.where("assignedPenro", "==", user.province);
  } else if (user.role === CENRO_PERSONNEL) {
    if (!user.cenro) return [];
    query = query.where("assignedCenro", "==", user.cenro);
  } else if (user.role !== REGIONAL_ADMIN) {
    return [];
  }

  const snap = await query.orderBy("dueDate", "asc").get();
  return snap.docs.map((d) => leaseFromSnap(d.id, d.data()));
}

export async function getLeaseById(id: string): Promise<LeaseDoc | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return leaseFromSnap(doc.id, doc.data()!);
}

export async function createLease(
  input: LeaseInput,
  createdBy: string
): Promise<LeaseDoc> {
  const now = new Date().toISOString();
  const data = {
    ...input,
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
    createdBy,
  };
  const ref = await adminDb.collection(COLLECTION).add(data);
  return { id: ref.id, ...data };
}

export async function updateLease(
  id: string,
  input: Partial<LeaseInput>
): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(id)
    .update({ ...input, updatedAt: new Date().toISOString() });
}

export async function deleteLease(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
