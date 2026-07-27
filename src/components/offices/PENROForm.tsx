"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PENRODoc } from "@/types";

interface PENROFormProps {
  penro?: PENRODoc;
  onSubmit?: () => void;
}

export function PENROForm({ penro, onSubmit }: PENROFormProps) {
  const router = useRouter();
  const [name, setName] = useState(penro?.name ?? "");
  const [code, setCode] = useState(penro?.code ?? "");
  const [province, setProvince] = useState(penro?.province ?? "");
  const [region, setRegion] = useState(penro?.region ?? "");
  const [address, setAddress] = useState(penro?.address ?? "");
  const [contactNumber, setContactNumber] = useState(penro?.contactNumber ?? "");
  const [email, setEmail] = useState(penro?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const method = penro ? "PUT" : "POST";
      const body = {
        ...(penro && { id: penro.id }),
        name,
        code,
        province,
        region,
        address,
        contactNumber,
        email,
      };

      const response = await fetch("/api/penros", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save PENRO");
      }

      onSubmit?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save PENRO");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Name *</span>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Code *</span>
          <input
            required
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Province *</span>
          <input
            required
            type="text"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Region *</span>
          <input
            required
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Address *</span>
        <input
          required
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Contact Number *</span>
          <input
            required
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email *</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Saving..." : penro ? "Update PENRO" : "Create PENRO"}
      </button>
    </form>
  );
}
