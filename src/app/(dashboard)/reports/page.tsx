import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { listLeasesForUser } from "@/lib/data/leases";
import { listPaymentsForUser } from "@/lib/data/payments";
import { StatCard } from "@/components/StatCard";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { RevenueBarChart } from "@/components/reports/RevenueBarChart";
import type { PaymentDoc } from "@/types";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user.role, "reports:generate")) redirect("/dashboard");

  const [leases, payments] = await Promise.all([
    listLeasesForUser(user),
    listPaymentsForUser(user),
  ]);

  const currentYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth();

  const monthlyRevenue = payments
    .filter((p) => new Date(p.paymentDate).getFullYear() === currentYear && new Date(p.paymentDate).getMonth() === thisMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  const annualRevenue = payments
    .filter((p) => new Date(p.paymentDate).getFullYear() === currentYear)
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueCount = leases.filter((l) => l.status === "OVERDUE").length;
  const paidCount = leases.filter((l) => l.status === "PAID").length;
  const collectionRate = leases.length ? Math.round((paidCount / leases.length) * 100) : 0;

  const revenueByPenro = groupSum(payments, (p) => p.province);
  const revenueByMunicipality = groupSum(
    payments,
    (p) => leases.find((l) => l.id === p.leaseId)?.municipality ?? "Unknown"
  );
  const revenueByType = groupSum(
    payments,
    (p) => leases.find((l) => l.id === p.leaseId)?.leaseType ?? "unknown"
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500">Collection performance overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Monthly Collection" value={money(monthlyRevenue)} />
        <StatCard label="Annual Collection" value={money(annualRevenue)} />
        <StatCard label="Overdue Accounts" value={overdueCount} accent="danger" />
        <StatCard label="Collection Rate" value={`${collectionRate}%`} accent="success" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Revenue by PENRO
          </h2>
          <ExportCsvButton
            filename="revenue-by-penro.csv"
            headers={["PENRO Office", "Revenue"]}
            rows={Object.entries(revenueByPenro)}
          />
        </div>
        <RevenueBarChart data={toChartData(revenueByPenro)} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Revenue by Municipality
          </h2>
          <ExportCsvButton
            filename="revenue-by-municipality.csv"
            headers={["Municipality", "Revenue"]}
            rows={Object.entries(revenueByMunicipality)}
          />
        </div>
        <RevenueBarChart data={toChartData(revenueByMunicipality)} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Revenue by Property Type
          </h2>
          <ExportCsvButton
            filename="revenue-by-type.csv"
            headers={["Lease Type", "Revenue"]}
            rows={Object.entries(revenueByType)}
          />
        </div>
        <RevenueBarChart data={toChartData(revenueByType)} />
      </section>
    </div>
  );
}

function money(value: number) {
  return value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
}

function groupSum(items: PaymentDoc[], keyFn: (item: PaymentDoc) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] ?? 0) + item.amount;
    return acc;
  }, {});
}

function toChartData(record: Record<string, number>) {
  return Object.entries(record).map(([name, revenue]) => ({ name, revenue }));
}
