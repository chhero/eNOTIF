import "server-only";

// Firebase Admin SDK initialization. This must only ever be imported from
// server-side code (API routes, server components, middleware helpers).
// Never import this file from a "use client" component.
//
// Initialization is lazy (deferred until first use) so that simply importing
// this module - e.g. during `next build`'s route analysis - does not require
// credentials to be present. Credentials are only needed at request time.

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function loadServiceAccount() {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineJson) {
    return JSON.parse(inlineJson);
  }

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  if (keyPath) {
    // Lazily require fs only when a file path is configured.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs") as typeof import("node:fs");
    return JSON.parse(fs.readFileSync(keyPath, "utf-8"));
  }

  throw new Error(
    "Firebase Admin SDK credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_JSON " +
      "or FIREBASE_SERVICE_ACCOUNT_KEY_PATH in your environment (see .env.local.example)."
  );
}

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }
  const serviceAccount = loadServiceAccount();
  return initializeApp({
    credential: cert(serviceAccount),
  });
}

let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

function resolveAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getAdminApp());
  }
  return cachedAuth;
}

function resolveDb(): Firestore {
  if (!cachedDb) {
    // eNOTIF uses its own named Firestore database ('enotif') because this
    // Firebase project (esapa-denr-r8) is shared with other DENR R8 systems.
    cachedDb = getFirestore(getAdminApp(), "enotif");
  }
  return cachedDb;
}

// Proxies defer all initialization (and the credential lookup above) until a
// property/method is actually accessed at request time.
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const value = resolveAuth()[prop as keyof Auth];
    return typeof value === "function" ? value.bind(resolveAuth()) : value;
  },
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const value = resolveDb()[prop as keyof Firestore];
    return typeof value === "function" ? value.bind(resolveDb()) : value;
  },
});

