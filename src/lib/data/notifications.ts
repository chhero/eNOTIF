import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import { REGIONAL_ADMIN, PENRO_ADMIN, CENRO_PERSONNEL, CASHIER } from "@/lib/constants";
import type { NotificationDoc, SessionUser } from "@/types";

const COLLECTION = "notifications";

function fromSnap(id: string, data: FirebaseFirestore.DocumentData): NotificationDoc {
  return { id, ...data } as NotificationDoc;
}

export async function listNotificationsForUser(user: SessionUser): Promise<NotificationDoc[]> {
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

  const snap = await query.orderBy("sentDate", "desc").limit(200).get();
  return snap.docs.map((d) => fromSnap(d.id, d.data()));
}

export async function listNotificationsForLease(leaseId: string): Promise<NotificationDoc[]> {
  const snap = await adminDb
    .collection(COLLECTION)
    .where("leaseId", "==", leaseId)
    .orderBy("sentDate", "desc")
    .get();
  return snap.docs.map((d) => fromSnap(d.id, d.data()));
}
