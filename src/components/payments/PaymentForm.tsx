"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeaseDoc } from "@/types";

export function PaymentForm({ leases }: { leases: LeaseDoc[] }) {
  const router = useRouter();
  const [leaseId, setLeaseId] = useState(leases[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [receiptNumber, setReceiptNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedLease = leases.find((l) => l.id === leaseId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!leaseId) {
      setError("Select a lease to record payment for.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId,
          amount: Number(amount),
          paymentDate,
          receiptNumber,
          remarks: remarks || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to record payment");
      }

      setAmount("");
      setReceiptNumber("");
      setRemarks("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Lease</span>
        <select
          value={leaseId}
          onChange={(e) => setLeaseId(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {leases.map((l) => (
            <option key={l.id} value={l.id}>
              {l.flaNumber} &middot; {l.applicantName}
            </option>
          ))}
        </select>
      </label>

      {selectedLease && (
        <p className="text-xs text-slate-500">
          Annual rental:{" "}
          {selectedLease.annualRental.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
          {" "}&middot; Due {selectedLease.dueDate}
        </p>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Amount (PHP)</span>
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Payment Date</span>
        <input
          required
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Receipt Number</span>
        <input
          required
          value={receiptNumber}
          onChange={(e) => setReceiptNumber(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Remarks (optional)</span>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          rows={2}
        />
      </label>

      <button
        type="submit"
        disabled={submitting || !leaseId}
        className="rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
      >
        {submitting ? "Recording..." : "Record Payment"}
      </button>
    </form>
  );
}
