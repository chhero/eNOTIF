import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import type { AuditLogDoc, SessionUser } from "@/types";

export async function writeAuditLog(
  user: SessionUser,
  action: string,
  details?: string
): Promise<void> {
  const doc: Omit<AuditLogDoc, "id"> = {
    userId: user.uid,
    userName: user.name,
    action,
    details,
    dateTime: new Date().toISOString(),
  };
  await adminDb.collection("audit_logs").add(doc);
}

export async function listAuditLogs(limit = 200): Promise<AuditLogDoc[]> {
  const snap = await adminDb
    .collection("audit_logs")
    .orderBy("dateTime", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AuditLogDoc);
}
