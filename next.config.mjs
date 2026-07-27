/** @type {import('next').NextConfig} */
// For Cloud Run backend, pass env vars from secrets via .env.local
// which Firebase Hosting will inject at runtime
const nextConfig = {
  env: {
    FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  },
  // firebase-admin is on Next's default server-external-packages list, which
  // makes Turbopack externalize it via a hashed runtime import
  // (e.g. "firebase-admin-<hash>/app"). The Firebase Hosting Next.js
  // integration's bundled Cloud Function does not resolve that hashed
  // external import, causing "Cannot find package 'firebase-admin-<hash>'"
  // at runtime and every server-side auth call (incl. session login) to
  // 500. Force firebase-admin to be bundled instead of externalized.
  transpilePackages: ["firebase-admin"],
};

export default nextConfig;
