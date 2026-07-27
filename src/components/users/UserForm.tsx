"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/lib/constants";
import type { UserRole, PENRODoc, CENRODoc } from "@/types";

export function UserForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("cenro_personnel");
  const [province, setProvince] = useState("");
  const [cenro, setCenro] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [penros, setPenros] = useState<PENRODoc[]>([]);
  const [cenros, setCenros] = useState<CENRODoc[]>([]);
  const [officesLoading, setOfficesLoading] = useState(true);

  useEffect(() => {
    async function loadOffices() {
      try {
        const [penroRes, cenroRes] = await Promise.all([
          fetch("/api/penros"),
          fetch("/api/cenros"),
        ]);
        const penroData = await penroRes.json().catch(() => ({}));
        const cenroData = await cenroRes.json().catch(() => ({}));
        setPenros(penroData.penros ?? []);
        setCenros(cenroData.cenros ?? []);
      } finally {
        setOfficesLoading(false);
      }
    }
    loadOffices();
  }, []);

  useEffect(() => {
    if (!province && penros.length > 0) {
      setProvince(penros[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penros]);

  const selectedPenro = penros.find((p) => p.name === province);
  const cenroOptions = cenros.filter((c) => c.penroId === selectedPenro?.id);
  const needsProvince = role !== "regional_admin";
  const needsCenro = role === "cenro_personnel";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          province: needsProvince ? province : undefined,
          cenro: needsCenro ? cenro : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create user");
      }

      setName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
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
        <span className="mb-1 block font-medium text-slate-700">Full Name</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Email</span>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Temporary Password</span>
        <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Role</span>
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          {USER_ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </label>

      {needsProvince && (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">PENRO Office</span>
          <select
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setCenro("");
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            disabled={officesLoading}
          >
            <option value="" disabled>
              {officesLoading ? "Loading offices..." : "Select PENRO"}
            </option>
            {penros.map((office) => (
              <option key={office.id} value={office.name}>{office.name}</option>
            ))}
          </select>
        </label>
      )}

      {needsCenro && (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">CENRO Office</span>
          <select
            required
            value={cenro}
            onChange={(e) => setCenro(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            disabled={!selectedPenro}
          >
            <option value="" disabled>Select CENRO</option>
            {cenroOptions.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
      >
        {submitting ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
