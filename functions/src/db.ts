import { getFirestore, type Firestore } from "firebase-admin/firestore";

// eNOTIF uses its own named Firestore database ('enotif') because this
// Firebase project (esapa-denr-r8) is shared with other DENR R8 systems
// (eSAPA, eNOTIG), which use the project's (default) database.
const DATABASE_ID = "enotif";

let cachedDb: Firestore | null = null;

export function getEnotifDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(DATABASE_ID);
  }
  return cachedDb;
}
