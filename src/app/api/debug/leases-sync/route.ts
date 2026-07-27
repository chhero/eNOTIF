import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Debug endpoint to check all unique PENRO and CENRO values from leases.
 */
export async function GET(request: NextRequest) {
  try {
    const snap = await adminDb.collection("leases").get();
    
    const penros = new Set<string>();
    const cenros = new Set<string>();
    const leaseData: Array<{
      id: string;
      flaNumber: string;
      applicantName: string;
      assignedPenro?: string;
      assignedCenro?: string;
    }> = [];

    snap.docs.forEach((doc) => {
      const lease = doc.data();
      leaseData.push({
        id: doc.id,
        flaNumber: lease.flaNumber,
        applicantName: lease.applicantName,
        assignedPenro: lease.assignedPenro,
        assignedCenro: lease.assignedCenro,
      });

      if (lease.assignedPenro) penros.add(lease.assignedPenro);
      if (lease.assignedCenro) cenros.add(lease.assignedCenro);
    });

    return NextResponse.json({
      totalLeases: snap.docs.length,
      uniquePenros: Array.from(penros).sort(),
      uniqueCenros: Array.from(cenros).sort(),
      leases: leaseData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
