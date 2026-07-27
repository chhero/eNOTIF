"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NotificationSettingsDoc } from "@/types";

export function SettingsForm({ settings }: { settings: NotificationSettingsDoc }) {
  const router = useRouter();
  const [reminderDaysBeforeDue, setReminderDaysBeforeDue] = useState(
    settings.reminderDaysBeforeDue
  );
  const [secondReminderDaysBeforeDue, setSecondReminderDaysBeforeDue] = useState(
    settings.secondReminderDaysBeforeDue
  );
  const [demandLetterGraceDays, setDemandLetterGraceDays] = useState(
    settings.demandLetterGraceDays
  );
  const [demandLetterResponseDays, setDemandLetterResponseDays] = useState(
    settings.demandLetterResponseDays
  );
  const [penaltyRatePercent, setPenaltyRatePercent] = useState(
    settings.penaltyRatePercent
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderDaysBeforeDue,
          secondReminderDaysBeforeDue,
          demandLetterGraceDays,
          demandLetterResponseDays,
          penaltyRatePercent,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save settings");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
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
      {success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Settings saved. Changes apply to the next daily scheduler run.
        </p>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          First reminder (days before due date)
        </span>
        <p className="mb-1 text-xs text-slate-500">
          Sent to PENRO, CENRO, cashier, and lessee.
        </p>
        <input
          required
          type="number"
          min={1}
          max={90}
          value={reminderDaysBeforeDue}
          onChange={(e) => setReminderDaysBeforeDue(Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Second reminder (days before due date)
        </span>
        <p className="mb-1 text-xs text-slate-500">Sent to the lessee only.</p>
        <input
          required
          type="number"
          min={1}
          max={90}
          value={secondReminderDaysBeforeDue}
          onChange={(e) => setSecondReminderDaysBeforeDue(Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Demand letter grace period (days after due date)
        </span>
        <p className="mb-1 text-xs text-slate-500">
          How many days after the due date to wait, while unpaid, before the demand letter is
          generated and sent. Use 0 to send it as soon as the lease becomes overdue.
        </p>
        <input
          required
          type="number"
          min={0}
          max={90}
          value={demandLetterGraceDays}
          onChange={(e) => setDemandLetterGraceDays(Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Response period stated in the demand letter (days)
        </span>
        <p className="mb-1 text-xs text-slate-500">
          The number of days the lessee is given to settle the balance, as printed in the letter.
        </p>
        <input
          required
          type="number"
          min={1}
          max={90}
          value={demandLetterResponseDays}
          onChange={(e) => setDemandLetterResponseDays(Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Overdue penalty / surcharge rate (%)
        </span>
        <p className="mb-1 text-xs text-slate-500">
          Percentage of the annual rental added as a penalty once a lease becomes overdue. This is
          shown as the &quot;Penalty&quot; line in the demand letter.
        </p>
        <input
          required
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={penaltyRatePercent}
          onChange={(e) => setPenaltyRatePercent(Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
