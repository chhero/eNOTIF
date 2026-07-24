"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteLeaseButton({ leaseId }: { leaseId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const response = await fetch(`/api/leases/${leaseId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete lease");
      router.push("/leases");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete Lease
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-red-700">Delete this lease permanently?</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? "Deleting..." : "Confirm"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        Cancel
      </button>
    </div>
  );
}
