"use client";

import { useMemo, useState } from "react";
import type { LeaseDoc, PaymentDoc } from "@/types";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { RevenueBarChart } from "@/components/reports/RevenueBarChart";

type RangeMode = "month" | "year" | "all";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function money(value: number) {
  return value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
}

function groupSum(
  items: PaymentDoc[],
  keyFn: (item: PaymentDoc) => string
): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] ?? 0) + item.amount;
    return acc;
  }, {});
}

function toChartData(record: Record<string, number>) {
  return Object.entries(record).map(([name, revenue]) => ({ name, revenue }));
}

export function ReportsClient({
  leases,
  payments,
}: {
  leases: LeaseDoc[];
  payments: PaymentDoc[];
}) {
  const now = new Date();
  const [rangeMode, setRangeMode] = useState<RangeMode>("year");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const years = useMemo(() => {
    const paymentYears = payments.map((p) => new Date(p.paymentDate).getFullYear());
    const minYear = paymentYears.length
      ? Math.min(...paymentYears, now.getFullYear())
      : now.getFullYear();
    const list: number[] = [];
    for (let y = now.getFullYear(); y >= minYear; y--) list.push(y);
    return list;
  }, [payments, now]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const d = new Date(p.paymentDate);
      if (rangeMode === "all") return true;
      if (rangeMode === "year") return d.getFullYear() === year;
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [payments, rangeMode, year, month]);

  const rangeLabel =
    rangeMode === "all"
      ? "All Time"
      : rangeMode === "year"
      ? `${year}`
      : `${MONTH_NAMES[month]} ${year}`;

  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const fileSuffix = rangeLabel.replace(/\s+/g, "-").toLowerCase();

  const revenueByPenro = groupSum(filteredPayments, (p) => p.province);
  const revenueByMunicipality = groupSum(
    filteredPayments,
    (p) => leases.find((l) => l.id === p.leaseId)?.municipality ?? "Unknown"
  );
  const revenueByType = groupSum(
    filteredPayments,
    (p) => leases.find((l) => l.id === p.leaseId)?.leaseType ?? "unknown"
  );

  return (
    <div className="space-y-8">
      {/* Date range selector for CSV export & charts */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Range
          </label>
          <select
            value={rangeMode}
            onChange={(e) => setRangeMode(e.target.value as RangeMode)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="month">Specific Month</option>
            <option value="year">Whole Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {rangeMode !== "all" && (
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        {rangeMode === "month" && (
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        <p className="text-sm text-slate-500 sm:ml-auto">
          Showing <span className="font-semibold text-slate-700">{rangeLabel}</span> &middot;{" "}
          {money(totalRevenue)} collected
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Revenue by PENRO
          </h2>
          <ExportCsvButton
            filename={`revenue-by-penro-${fileSuffix}.csv`}
            headers={["PENRO Office", "Revenue"]}
            rows={Object.entries(revenueByPenro)}
          />
        </div>
        <RevenueBarChart data={toChartData(revenueByPenro)} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Revenue by Municipality
          </h2>
          <ExportCsvButton
            filename={`revenue-by-municipality-${fileSuffix}.csv`}
            headers={["Municipality", "Revenue"]}
            rows={Object.entries(revenueByMunicipality)}
          />
        </div>
        <RevenueBarChart data={toChartData(revenueByMunicipality)} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Revenue by Property Type
          </h2>
          <ExportCsvButton
            filename={`revenue-by-type-${fileSuffix}.csv`}
            headers={["Lease Type", "Revenue"]}
            rows={Object.entries(revenueByType)}
          />
        </div>
        <RevenueBarChart data={toChartData(revenueByType)} />
      </section>
    </div>
  );
}
