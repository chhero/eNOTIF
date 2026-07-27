import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import type { PENRODoc, CENRODoc, SessionUser } from "@/types";
import { writeAuditLog } from "@/lib/data/audit";
import { ValidationError } from "@/lib/auth/session";

const PENRO_COLLECTION = "penros";
const CENRO_COLLECTION = "cenros";

// ============= PENRO Functions =============

export async function listPENROs(): Promise<PENRODoc[]> {
  const snap = await adminDb
    .collection(PENRO_COLLECTION)
    .orderBy("province", "asc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PENRODoc));
}

export async function getPENROById(id: string): Promise<PENRODoc | null> {
  const doc = await adminDb.collection(PENRO_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as PENRODoc;
}

export async function createPENRO(
  input: Omit<PENRODoc, "id" | "createdAt" | "updatedAt">,
  user: SessionUser
): Promise<PENRODoc> {
  const now = new Date().toISOString();
  const data: Omit<PENRODoc, "id"> = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const ref = await adminDb.collection(PENRO_COLLECTION).add(data);

  await writeAuditLog(
    user,
    "PENRO_CREATED",
    `Created PENRO: ${input.name} (${input.province})`
  );

  return { id: ref.id, ...data };
}

export async function updatePENRO(
  id: string,
  input: Partial<Omit<PENRODoc, "id" | "createdAt" | "updatedAt">>,
  user: SessionUser
): Promise<PENRODoc> {
  const existing = await getPENROById(id);
  if (!existing) throw new Error("PENRO not found");

  const now = new Date().toISOString();
  const data = { ...input, updatedAt: now };

  await adminDb.collection(PENRO_COLLECTION).doc(id).update(data);

  await writeAuditLog(
    user,
    "PENRO_UPDATED",
    `Updated PENRO: ${existing.name}`
  );

  return { ...existing, ...data };
}

export async function deletePENRO(id: string, user: SessionUser): Promise<void> {
  const existing = await getPENROById(id);
  if (!existing) throw new Error("PENRO not found");

  // Check if any CENROs reference this PENRO
  const cenroSnap = await adminDb
    .collection(CENRO_COLLECTION)
    .where("penroId", "==", id)
    .get();

  if (!cenroSnap.empty) {
    throw new Error("Cannot delete PENRO with associated CENROs");
  }

  await adminDb.collection(PENRO_COLLECTION).doc(id).delete();

  await writeAuditLog(
    user,
    "PENRO_DELETED",
    `Deleted PENRO: ${existing.name}`
  );
}

// ============= CENRO Functions =============

export async function listCENROs(): Promise<CENRODoc[]> {
  const snap = await adminDb
    .collection(CENRO_COLLECTION)
    .orderBy("name", "asc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CENRODoc));
}

export async function listCENROsByPENRO(penroId: string): Promise<CENRODoc[]> {
  // Note: intentionally no .orderBy() here — combining it with .where("penroId", ...)
  // requires a Firestore composite index. Sort in memory instead since CENRO lists
  // per PENRO are small.
  const snap = await adminDb
    .collection(CENRO_COLLECTION)
    .where("penroId", "==", penroId)
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as CENRODoc))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Verifies that `penroName` and (optionally) `cenroName` correspond to real,
 * currently-registered PENRO/CENRO offices (and that the CENRO belongs to
 * that PENRO). Throws a ValidationError otherwise. Used by the leases/users
 * API routes since the PENRO/CENRO office select lists are populated from
 * Firestore rather than a fixed set of names.
 */
export async function verifyOfficeAssignment(
  penroName: string,
  cenroName?: string
): Promise<void> {
  const penros = await listPENROs();
  const penro = penros.find((p) => p.name === penroName);
  if (!penro) {
    throw new ValidationError(`Assigned PENRO office "${penroName}" was not found`);
  }

  if (cenroName) {
    const cenros = await listCENROsByPENRO(penro.id);
    if (!cenros.some((c) => c.name === cenroName)) {
      throw new ValidationError(
        `Assigned CENRO office "${cenroName}" does not belong to PENRO "${penroName}"`
      );
    }
  }
}

export async function getCENROById(id: string): Promise<CENRODoc | null> {
  const doc = await adminDb.collection(CENRO_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as CENRODoc;
}

export async function createCENRO(
  input: Omit<CENRODoc, "id" | "createdAt" | "updatedAt">,
  user: SessionUser
): Promise<CENRODoc> {
  // Verify PENRO exists
  const penro = await getPENROById(input.penroId);
  if (!penro) throw new Error("PENRO not found");

  const now = new Date().toISOString();
  const data: Omit<CENRODoc, "id"> = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const ref = await adminDb.collection(CENRO_COLLECTION).add(data);

  await writeAuditLog(
    user,
    "CENRO_CREATED",
    `Created CENRO: ${input.name} under ${penro.name}`
  );

  return { id: ref.id, ...data };
}

export async function updateCENRO(
  id: string,
  input: Partial<Omit<CENRODoc, "id" | "createdAt" | "updatedAt">>,
  user: SessionUser
): Promise<CENRODoc> {
  const existing = await getCENROById(id);
  if (!existing) throw new Error("CENRO not found");

  // If penroId is being changed, verify the new one exists
  if (input.penroId && input.penroId !== existing.penroId) {
    const penro = await getPENROById(input.penroId);
    if (!penro) throw new Error("New PENRO not found");
  }

  const now = new Date().toISOString();
  const data = { ...input, updatedAt: now };

  await adminDb.collection(CENRO_COLLECTION).doc(id).update(data);

  await writeAuditLog(
    user,
    "CENRO_UPDATED",
    `Updated CENRO: ${existing.name}`
  );

  return { ...existing, ...data };
}

export async function deleteCENRO(id: string, user: SessionUser): Promise<void> {
  const existing = await getCENROById(id);
  if (!existing) throw new Error("CENRO not found");

  await adminDb.collection(CENRO_COLLECTION).doc(id).delete();

  await writeAuditLog(
    user,
    "CENRO_DELETED",
    `Deleted CENRO: ${existing.name}`
  );
}
