import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Debug endpoint to list all collections in Firestore.
 * ONLY for development - should be removed in production.
 */
export async function GET(request: NextRequest) {
  try {
    const collections = await adminDb.listCollections();
    const collectionNames = collections.map((c) => ({
      name: c.id,
      path: c.path,
    }));

    console.log("📚 Firestore Collections:", collectionNames);

    return NextResponse.json({
      collections: collectionNames,
      total: collectionNames.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
