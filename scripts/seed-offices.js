#!/usr/bin/env node
/**
 * Seed script to populate PENRO and CENRO data in Firestore.
 * 
 * Usage:
 *   node --env-file=.env.local scripts/seed-offices.js
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin using service account from .env.local
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON not found in environment");
  }
} catch (error) {
  console.error("❌ Failed to parse Firebase service account:");
  console.error(error.message);
  console.error("Make sure .env.local has FIREBASE_SERVICE_ACCOUNT_JSON set");
  process.exit(1);
}

let app;
try {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error.message);
  process.exit(1);
}

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

// Sample PENRO data (Philippines Region VIII)
const SAMPLE_PENROS = [
  {
    name: "PENRO Leyte",
    code: "PENRO-LY",
    province: "Leyte",
    region: "Region VIII",
    address: "DENR Compound, Baybay City, Leyte",
    contactNumber: "+63-53-5651234",
    email: "penro.leyte@denr.gov.ph",
  },
  {
    name: "PENRO Northern Samar",
    code: "PENRO-NS",
    province: "Northern Samar",
    region: "Region VIII",
    address: "DENR Office, Catarman, Northern Samar",
    contactNumber: "+63-55-2351567",
    email: "penro.northernsamar@denr.gov.ph",
  },
  {
    name: "PENRO Samar",
    code: "PENRO-SM",
    province: "Samar",
    region: "Region VIII",
    address: "DENR Office, Calbayog City, Samar",
    contactNumber: "+63-56-5621890",
    email: "penro.samar@denr.gov.ph",
  },
  {
    name: "PENRO Eastern Samar",
    code: "PENRO-ES",
    province: "Eastern Samar",
    region: "Region VIII",
    address: "DENR Office, Borongan, Eastern Samar",
    contactNumber: "+63-55-3456789",
    email: "penro.easternsamar@denr.gov.ph",
  },
];

// Sample CENRO data
const SAMPLE_CENROS = [
  {
    name: "CENRO Baybay",
    code: "CENRO-BB",
    province: "Leyte",
    region: "Region VIII",
    address: "CENRO Office, Baybay City, Leyte",
    contactNumber: "+63-53-5651235",
    email: "cenro.baybay@denr.gov.ph",
    penroId: null, // Will be set after PENRO is created
  },
  {
    name: "CENRO Ormoc",
    code: "CENRO-OR",
    province: "Leyte",
    region: "Region VIII",
    address: "CENRO Office, Ormoc City, Leyte",
    contactNumber: "+63-53-5621236",
    email: "cenro.ormoc@denr.gov.ph",
    penroId: null,
  },
  {
    name: "CENRO Catarman",
    code: "CENRO-CT",
    province: "Northern Samar",
    region: "Region VIII",
    address: "CENRO Office, Catarman, Northern Samar",
    contactNumber: "+63-55-2351568",
    email: "cenro.catarman@denr.gov.ph",
    penroId: null,
  },
  {
    name: "CENRO Calbayog",
    code: "CENRO-CB",
    province: "Samar",
    region: "Region VIII",
    address: "CENRO Office, Calbayog City, Samar",
    contactNumber: "+63-56-5621891",
    email: "cenro.calbayog@denr.gov.ph",
    penroId: null,
  },
  {
    name: "CENRO Borongan",
    code: "CENRO-BR",
    province: "Eastern Samar",
    region: "Region VIII",
    address: "CENRO Office, Borongan, Eastern Samar",
    contactNumber: "+63-55-3456790",
    email: "cenro.borongan@denr.gov.ph",
    penroId: null,
  },
];

async function seedOffices() {
  console.log("🌱 Starting to seed PENRO and CENRO data...\n");

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing PENRO and CENRO data...");
    const penroSnap = await db.collection("penros").get();
    for (const doc of penroSnap.docs) {
      await doc.ref.delete();
    }
    const cenroSnap = await db.collection("cenros").get();
    for (const doc of cenroSnap.docs) {
      await doc.ref.delete();
    }
    console.log("✅ Cleared existing data\n");

    // Seed PENROs
    console.log("📝 Creating PENRO records...");
    const penroMap = {};
    
    for (const penro of SAMPLE_PENROS) {
      const now = new Date().toISOString();
      const penroData = {
        ...penro,
        createdAt: now,
        updatedAt: now,
      };
      
      const ref = await db.collection("penros").add(penroData);
      penroMap[penro.province] = ref.id;
      console.log(`  ✓ Created: ${penro.name} (${ref.id})`);
    }
    console.log(`✅ Created ${Object.keys(penroMap).length} PENRO records\n`);

    // Seed CENROs
    console.log("📝 Creating CENRO records...");
    for (const cenro of SAMPLE_CENROS) {
      const penroId = penroMap[cenro.province];
      if (!penroId) {
        console.warn(`  ⚠️  Skipping ${cenro.name}: No PENRO found for ${cenro.province}`);
        continue;
      }

      const now = new Date().toISOString();
      const cenroData = {
        ...cenro,
        penroId,
        createdAt: now,
        updatedAt: now,
      };

      const ref = await db.collection("cenros").add(cenroData);
      console.log(`  ✓ Created: ${cenro.name} (${ref.id})`);
    }
    console.log(`✅ Created ${SAMPLE_CENROS.length} CENRO records\n`);

    console.log("✨ Seeding complete!\n");
    console.log("You can now:");
    console.log("  • View PENROs at: http://localhost:3000/penros");
    console.log("  • View CENROs at: http://localhost:3000/cenros");
    console.log("  • Create new PENRO/CENRO records via the UI");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedOffices();
