import { getCurrentUser } from "@/lib/auth/session";
import { listLeasesForUser } from "@/lib/data/leases";
import { listPaymentsForUser } from "@/lib/data/payments";
import { StatCard } from "@/components/StatCard";
import { redirect } from "next/navigation";
import { isBefore, isToday, isWithinInterval, addDays } from "date-fns";
import {
  BanknotesIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  HomeIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Foreshore lease rental collection overview
        </p>
      </div>

      {/* Hero metrics: the two numbers leadership cares about most */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Revenue Collected"
          value={revenue.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
          accent="success"
          icon={BanknotesIcon}
          hero
        />
        <StatCard
          label="Collection Rate"
          value={`${collectionRate}%`}
          accent="success"
          icon={ChartBarIcon}
          hero
        />
      </div>

      {/* Lease portfolio breakdown */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Lease Portfolio
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Registered Leases" value={leases.length} icon={BuildingOffice2Icon} />
          <StatCard label="Residential" value={residential} icon={HomeIcon} />
          <StatCard label="Commercial" value={commercial} icon={BuildingStorefrontIcon} />
          <StatCard label="Industrial" value={industrial} icon={Cog6ToothIcon} />
        </div>
      </section>

      {/* Payment urgency status */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Payment Status
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Upcoming Payments (10 days)" value={upcoming} accent="warning" icon={ClockIcon} />
          <StatCard label="Due Today" value={dueToday} accent="warning" icon={CalendarDaysIcon} />
          <StatCard label="Overdue Accounts" value={overdue} accent="danger" icon={ExclamationTriangleIcon} />
        </div>
      </section>
    </div>
  );
}
