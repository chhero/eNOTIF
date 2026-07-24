import { getEnotifDb } from "../db";
import type { UserDoc } from "../types";

/** Finds active users to notify for a lease's assigned PENRO/CENRO offices. */
export async function findRecipientsForLease(
  assignedPenro: string,
  assignedCenro: string
): Promise<UserDoc[]> {
  const db = getEnotifDb();

  const [penroSnap, cenroSnap, cashierSnap] = await Promise.all([
    db
      .collection("users")
      .where("province", "==", assignedPenro)
      .where("role", "==", "penro_admin")
      .where("status", "==", "active")
      .get(),
    db
      .collection("users")
      .where("cenro", "==", assignedCenro)
      .where("role", "==", "cenro_personnel")
      .where("status", "==", "active")
      .get(),
    db
      .collection("users")
      .where("province", "==", assignedPenro)
      .where("role", "==", "cashier")
      .where("status", "==", "active")
      .get(),
  ]);

  const toUser = (doc: FirebaseFirestore.QueryDocumentSnapshot) =>
    ({ id: doc.id, ...doc.data() }) as UserDoc;

  return [
    ...penroSnap.docs.map(toUser),
    ...cenroSnap.docs.map(toUser),
    ...cashierSnap.docs.map(toUser),
  ];
}
