import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listLeasesForUser } from "@/lib/data/leases";
import { can } from "@/lib/rbac";
import { LEASE_TYPES, DOCUMENT_TYPES } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";

export default async function LeasesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const leases = await listLeasesForUser(user);
  const canCreate = can(user.role, "leases:create");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Foreshore Leases</h1>
          <p className="text-sm text-slate-500">
            {leases.length} lease{leases.length === 1 ? "" : "s"} in your scope
          </p>
        </div>
        {canCreate && (
          <Link
            href="/leases/new"
            className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            + Register Lease
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">FLA No.</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Doc Type</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Applicant</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Type</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Occupational Rental</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Due Date</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">PENRO / CENRO</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leases.map((lease) => (
              <tr key={lease.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/leases/${lease.id}`} className="font-medium text-green-700 hover:underline">
                    {lease.flaNumber}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {DOCUMENT_TYPES.find((t) => t.value === lease.documentType)?.label ?? lease.documentType}
                </td>
                <td className="px-4 py-2">{lease.applicantName}</td>
                <td className="px-4 py-2">
                  {LEASE_TYPES.find((t) => t.value === lease.leaseType)?.label ?? lease.leaseType}
                </td>
                <td className="px-4 py-2">
                  {lease.annualRental.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                </td>
                <td className="px-4 py-2">{lease.dueDate}</td>
                <td className="px-4 py-2">
                  {lease.assignedPenro} / {lease.assignedCenro}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={lease.status} />
                </td>
              </tr>
            ))}
            {leases.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No leases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
