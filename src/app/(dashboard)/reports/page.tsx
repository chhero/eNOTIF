import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { listLeasesForUser } from "@/lib/data/leases";
import { listPaymentsForUser } from "@/lib/data/payments";
import { StatCard } from "@/components/StatCard";
import { ReportsClient } from "@/components/reports/ReportsClient";

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

      <ReportsClient leases={leases} payments={payments} />
    </div>
  );
}

function money(value: number) {
  return value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
}
