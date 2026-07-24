#!/usr/bin/env node
/**
 * One-off/reusable CLI to grant eNOTIF roles to a DENR Firebase Auth user.
 *
 * IMPORTANT: this script never asks for or touches passwords. Create the
 * Auth account first (email + password) directly in the Firebase Console:
 *   https://console.firebase.google.com/project/esapa-denr-r8/authentication/users
 * Then run this script with just the email to grant it an eNOTIF role.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-admin.js \
 *     --email=admin@denr.gov.ph --name="Juan Dela Cruz" --role=regional_admin
 *
 *   node --env-file=.env.local scripts/seed-admin.js \
 *     --email=penro.samar@denr.gov.ph --name="Maria Santos" \
 *     --role=penro_admin --province="PENRO Samar"
 *
 * Valid roles: regional_admin | penro_admin | cenro_personnel | cashier
 * --province is required for all roles except regional_admin.
 * --cenro is required for cenro_personnel.
 */

const fs = require("node:fs");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const VALID_ROLES = ["regional_admin", "penro_admin", "cenro_personnel", "cashier"];

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

async function main() {
  const { email, name, role, province, cenro } = parseArgs();

  if (!email) fail("--email is required");
  if (!name) fail("--name is required");
  if (!role || !VALID_ROLES.includes(role)) {
    fail(`--role is required and must be one of: ${VALID_ROLES.join(", ")}`);
  }
  if (role !== "regional_admin" && !province) {
    fail("--province is required for this role");
  }
  if (role === "cenro_personnel" && !cenro) {
    fail("--cenro is required for cenro_personnel");
  }

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccount = inlineJson
    ? JSON.parse(inlineJson)
    : JSON.parse(fs.readFileSync(keyPath, "utf-8"));

  const app = initializeApp({ credential: cert(serviceAccount) });
  const auth = getAuth(app);
  const db = getFirestore(app, "enotif");

  const authUser = await auth.getUserByEmail(email).catch(() => null);
  if (!authUser) {
    fail(
      `No Firebase Auth user found for ${email}. Create it first (with a password) in the ` +
        "Firebase Console: Authentication > Users > Add user."
    );
  }

  const existingClaims = authUser.customClaims ?? {};
  const claims = { ...existingClaims, enotif_role: role };
  if (role !== "regional_admin") claims.enotif_province = province;
  if (role === "cenro_personnel") claims.enotif_cenro = cenro;
  await auth.setCustomUserClaims(authUser.uid, claims);

  const now = new Date().toISOString();
  const userDoc = {
    name,
    email,
    role,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  if (role !== "regional_admin") userDoc.province = province;
  if (role === "cenro_personnel") userDoc.cenro = cenro;

  await db.collection("users").doc(authUser.uid).set(userDoc, { merge: true });

  console.log(`Success: ${email} (uid ${authUser.uid}) granted eNOTIF role "${role}".`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
