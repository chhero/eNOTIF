"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CENRODoc, PENRODoc } from "@/types";

interface CENROFormProps {
  cenro?: CENRODoc;
  penros: PENRODoc[];
  onSubmit?: () => void;
}

export function CENROForm({ cenro, penros, onSubmit }: CENROFormProps) {
  const router = useRouter();
  const [name, setName] = useState(cenro?.name ?? "");
  const [code, setCode] = useState(cenro?.code ?? "");
  const [province, setProvince] = useState(cenro?.province ?? "");
  const [region, setRegion] = useState(cenro?.region ?? "");
  const [address, setAddress] = useState(cenro?.address ?? "");
  const [contactNumber, setContactNumber] = useState(cenro?.contactNumber ?? "");
  const [email, setEmail] = useState(cenro?.email ?? "");
  const [penroId, setPenroId] = useState(cenro?.penroId ?? (penros[0]?.id ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const method = cenro ? "PUT" : "POST";
      const body = {
        ...(cenro && { id: cenro.id }),
        name,
        code,
        province,
        region,
        address,
        contactNumber,
        email,
        penroId,
      };

      const response = await fetch("/api/cenros", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save CENRO");
      }

      onSubmit?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save CENRO");
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

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">PENRO *</span>
        <select
          required
          value={penroId}
          onChange={(e) => setPenroId(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Select a PENRO</option>
          {penros.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.province})
            </option>
          ))}
        </select>
      </label>

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
        {submitting ? "Saving..." : cenro ? "Update CENRO" : "Create CENRO"}
      </button>
    </form>
  );
}
