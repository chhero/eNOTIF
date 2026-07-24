import { getCurrentUser } from "@/lib/auth/session";
import { listLeasesForUser } from "@/lib/data/leases";
import { listPaymentsForUser } from "@/lib/data/payments";
import { StatCard } from "@/components/StatCard";
import { redirect } from "next/navigation";
import { isBefore, isToday, isWithinInterval, addDays } from "date-fns";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [leases, payments] = await Promise.all([
    listLeasesForUser(user),
    listPaymentsForUser(user),
  ]);

  const today = new Date();
  const residential = leases.filter((l) => l.leaseType === "residential").length;
  const commercial = leases.filter((l) => l.leaseType === "commercial").length;
  const industrial = leases.filter((l) => l.leaseType === "industrial").length;

  const upcoming = leases.filter(
    (l) =>
      l.status !== "PAID" &&
      isWithinInterval(new Date(l.dueDate), { start: today, end: addDays(today, 10) })
  ).length;

  const dueToday = leases.filter(
    (l) => l.status !== "PAID" && isToday(new Date(l.dueDate))
  ).length;

  const overdue = leases.filter(
    (l) => l.status === "OVERDUE" || (l.status !== "PAID" && isBefore(new Date(l.dueDate), today) && !isToday(new Date(l.dueDate)))
  ).length;

  const paidCount = leases.filter((l) => l.status === "PAID").length;
  const collectionRate = leases.length
    ? Math.round((paidCount / leases.length) * 100)
    : 0;

  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Foreshore lease rental collection overview
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Registered Leases" value={leases.length} />
        <StatCard label="Residential" value={residential} />
        <StatCard label="Commercial" value={commercial} />
        <StatCard label="Industrial" value={industrial} />
        <StatCard label="Upcoming Payments (10 days)" value={upcoming} accent="warning" />
        <StatCard label="Due Today" value={dueToday} accent="warning" />
        <StatCard label="Overdue Accounts" value={overdue} accent="danger" />
        <StatCard label="Collection Rate" value={`${collectionRate}%`} accent="success" />
        <StatCard
          label="Revenue Collected"
          value={revenue.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
          accent="success"
        />
      </div>
    </div>
  );
}
