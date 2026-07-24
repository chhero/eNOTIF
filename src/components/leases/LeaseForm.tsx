"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEASE_TYPES, OFFICE_HIERARCHY, PENRO_OFFICES } from "@/lib/constants";
import type { LeaseDoc } from "@/types";

type FormState = {
  flaNumber: string;
  applicantName: string;
  email: string;
  contactNumber: string;
  mailingAddress: string;
  municipality: string;
  barangay: string;
  leaseType: string;
  area: string;
  annualRental: string;
  billingDate: string;
  dueDate: string;
  leaseStartDate: string;
  expirationDate: string;
  assignedPenro: string;
  assignedCenro: string;
};

function toFormState(lease?: LeaseDoc): FormState {
  return {
    flaNumber: lease?.flaNumber ?? "",
    applicantName: lease?.applicantName ?? "",
    email: lease?.email ?? "",
    contactNumber: lease?.contactNumber ?? "",
    mailingAddress: lease?.mailingAddress ?? "",
    municipality: lease?.municipality ?? "",
    barangay: lease?.barangay ?? "",
    leaseType: lease?.leaseType ?? LEASE_TYPES[0].value,
    area: lease?.area?.toString() ?? "",
    annualRental: lease?.annualRental?.toString() ?? "",
    billingDate: lease?.billingDate ?? "",
    dueDate: lease?.dueDate ?? "",
    leaseStartDate: lease?.leaseStartDate ?? "",
    expirationDate: lease?.expirationDate ?? "",
    assignedPenro: lease?.assignedPenro ?? PENRO_OFFICES[0],
    assignedCenro: lease?.assignedCenro ?? "",
  };
}

export function LeaseForm({ lease }: { lease?: LeaseDoc }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(lease));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cenroOptions = OFFICE_HIERARCHY[form.assignedPenro] ?? [];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      ...form,
      area: Number(form.area),
      annualRental: Number(form.annualRental),
    };

    try {
      const url = lease ? `/api/leases/${lease.id}` : "/api/leases";
      const method = lease ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save lease");
      }

      router.push(lease ? `/leases/${lease.id}` : "/leases");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lease");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="FLA Number">
          <input required value={form.flaNumber} onChange={(e) => update("flaNumber", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Applicant Name">
          <input required value={form.applicantName} onChange={(e) => update("applicantName", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Email Address">
          <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Contact Number">
          <input required value={form.contactNumber} onChange={(e) => update("contactNumber", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Mailing Address" full>
          <input required value={form.mailingAddress} onChange={(e) => update("mailingAddress", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Municipality">
          <input required value={form.municipality} onChange={(e) => update("municipality", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Barangay">
          <input required value={form.barangay} onChange={(e) => update("barangay", e.target.value)} className={inputClass} />
        </Field>

        <Field label="Lease Type">
          <select value={form.leaseType} onChange={(e) => update("leaseType", e.target.value)} className={inputClass}>
            {LEASE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Area (sqm)">
          <input required type="number" min="0" step="0.01" value={form.area} onChange={(e) => update("area", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Annual Rental (PHP)">
          <input required type="number" min="0" step="0.01" value={form.annualRental} onChange={(e) => update("annualRental", e.target.value)} className={inputClass} />
        </Field>

        <Field label="Billing Date">
          <input required type="date" value={form.billingDate} onChange={(e) => update("billingDate", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Due Date">
          <input required type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Lease Start Date">
          <input required type="date" value={form.leaseStartDate} onChange={(e) => update("leaseStartDate", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Expiration Date">
          <input required type="date" value={form.expirationDate} onChange={(e) => update("expirationDate", e.target.value)} className={inputClass} />
        </Field>

        <Field label="Assigned PENRO">
          <select
            value={form.assignedPenro}
            onChange={(e) => {
              update("assignedPenro", e.target.value);
              update("assignedCenro", "");
            }}
            className={inputClass}
          >
            {PENRO_OFFICES.map((office) => (
              <option key={office} value={office}>{office}</option>
            ))}
          </select>
        </Field>
        <Field label="Assigned CENRO">
          <select required value={form.assignedCenro} onChange={(e) => update("assignedCenro", e.target.value)} className={inputClass}>
            <option value="" disabled>Select CENRO</option>
            {cenroOptions.map((cenro) => (
              <option key={cenro} value={cenro}>{cenro}</option>
            ))}
          </select>
        </Field>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
      >
        {submitting ? "Saving..." : lease ? "Save Changes" : "Register Lease"}
      </button>
    </form>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600";
