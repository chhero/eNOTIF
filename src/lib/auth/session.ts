import "server-only";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import type { SessionUser, UserDoc } from "@/types";

/**
 * Verifies the current request's session cookie and loads the matching
 * Firestore user profile. Returns null if there is no valid session.
 * Use this in server components and API routes to get the signed-in user.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userSnap = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userSnap.exists) return null;

    const user = userSnap.data() as UserDoc;
    if (user.status === "disabled") return null;

    return {
      uid: decoded.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      province: user.province,
      cenro: user.cenro,
    };
  } catch {
    return null;
  }
}

/** Throws a 401-style error if no user is signed in. Use inside API routes. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Not authorized") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
