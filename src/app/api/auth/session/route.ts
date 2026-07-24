import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE_MS } from "@/lib/constants";

// POST: exchange a fresh Firebase ID token (from client-side sign-in) for an
// HttpOnly session cookie. GET/DELETE: clear the session cookie (logout).

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    // Verify the token is fresh (issued within the last 5 minutes) before
    // minting a longer-lived session cookie.
    await adminAuth.verifyIdToken(idToken, true);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_COOKIE_MAX_AGE_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid or expired credentials" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response;
}
