import "server-only";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { UserDoc } from "@/types";
import type { UserInput } from "@/lib/validation/user";

const COLLECTION = "users";

export async function listUsers(): Promise<UserDoc[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy("name").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserDoc);
}

/**
 * Creates (or reuses) a Firebase Auth account, sets eNOTIF's RBAC custom
 * claims, and stores the profile in Firestore.
 *
 * The Firebase project (esapa-denr-r8) is shared with other DENR Region VIII
 * systems (eSAPA, eNOTIG), which share the same Authentication user pool:
 *  - If the email already has an Auth account (e.g. an existing eSAPA user),
 *    it is reused instead of failing, and only the "enotif_*" custom claims
 *    are added/updated — any claims set by other apps are preserved.
 *  - Custom claims are namespaced with an "enotif_" prefix (see
 *    firestore.rules) so they never collide with claims used by other apps.
 */
export async function createUser(input: UserInput): Promise<UserDoc> {
  let authUser;
  try {
    authUser = await adminAuth.createUser({
      email: input.email,
      password: input.password,
      displayName: input.name,
    });
  } catch (error) {
    if (isAuthError(error) && error.code === "auth/email-already-exists") {
      authUser = await adminAuth.getUserByEmail(input.email);
    } else {
      throw error;
    }
  }

  const existingClaims = authUser.customClaims ?? {};
  await adminAuth.setCustomUserClaims(authUser.uid, {
    ...existingClaims,
    enotif_role: input.role,
    ...(input.province !== undefined && { enotif_province: input.province }),
    ...(input.cenro !== undefined && { enotif_cenro: input.cenro }),
  });

  const now = new Date().toISOString();
  const data: Omit<UserDoc, "id"> = {
    name: input.name,
    email: input.email,
    role: input.role,
    ...(input.province !== undefined && { province: input.province }),
    ...(input.cenro !== undefined && { cenro: input.cenro }),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  await adminDb.collection(COLLECTION).doc(authUser.uid).set(data);
  return { id: authUser.uid, ...data };
}

function isAuthError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function setUserStatus(
  id: string,
  status: "active" | "disabled"
): Promise<void> {
  await adminAuth.updateUser(id, { disabled: status === "disabled" });
  await adminDb
    .collection(COLLECTION)
    .doc(id)
    .update({ status, updatedAt: new Date().toISOString() });
}

