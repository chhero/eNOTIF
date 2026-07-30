import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getLeaseById } from "@/lib/data/leases";
import { listPaymentsForLease } from "@/lib/data/payments";
import { listNotificationsForLease } from "@/lib/data/notifications";
import { can, isWithinScope } from "@/lib/rbac";
import { LEASE_TYPES, DOCUMENT_TYPES } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { LeaseForm } from "@/components/leases/LeaseForm";
import { DeleteLeaseButton } from "@/components/leases/DeleteLeaseButton";

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const lease = await getLeaseById(id);
  if (!lease || !isWithinScope(user, lease)) {
    notFound();
  }

  const [payments, notifications] = await Promise.all([
    listPaymentsForLease(lease.id),
    listNotificationsForLease(lease.id),
  ]);

  const canEdit = can(user.role, "leases:edit") && isWithinScope(user, lease);
  const canDelete = can(user.role, "leases:delete");

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/leases" className="text-sm text-slate-500 hover:underline">
            &larr; Back to Leases
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900">
            {lease.flaNumber} &middot; {lease.applicantName}
          </h1>
          <div className="mt-1"><StatusBadge status={lease.status} /></div>
        </div>
        {canDelete && <DeleteLeaseButton leaseId={lease.id} />}
      </div>

      {canEdit ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Lease Details
          </h2>
          <LeaseForm lease={lease} />
        </section>
      ) : (
        <ReadOnlyDetails lease={lease} />
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Payment History
        </h2>
        <SimpleTable
          headers={["Date", "Amount", "Receipt No.", "Cashier"]}
          rows={payments.map((p) => [
            p.paymentDate,
            p.amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" }),
            p.receiptNumber,
            p.cashierName,
          ])}
          emptyLabel="No payments recorded yet."
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Notification History
        </h2>
        <SimpleTable
          headers={["Date", "Type", "Recipient", "Status"]}
          rows={notifications.map((n) => [n.sentDate, n.notificationType, n.recipient, n.status])}
          emptyLabel="No notifications sent yet."
        />
      </section>
    </div>
  );
}

function ReadOnlyDetails({ lease }: { lease: NonNullable<Awaited<ReturnType<typeof getLeaseById>>> }) {
  const rows: [string, string][] = [
    ["Document Type", DOCUMENT_TYPES.find((t) => t.value === lease.documentType)?.label ?? lease.documentType],
    ["Email", lease.email],
    ["Contact Number", lease.contactNumber],
    ["Mailing Address", lease.mailingAddress],
    ["Municipality / Barangay", `${lease.municipality} / ${lease.barangay}`],
    ["Lease Type", LEASE_TYPES.find((t) => t.value === lease.leaseType)?.label ?? lease.leaseType],
    ["Area", `${lease.area} sqm`],
    [
      "Occupational Rental",
      lease.annualRental.toLocaleString("en-PH", { style: "currency", currency: "PHP" }),
    ],
    ["Billing Date", lease.billingDate],
    ["Due Date", lease.dueDate],
    ["Lease Start Date", lease.leaseStartDate],
    ["Expiration Date", lease.expirationDate],
    ["Assigned PENRO / CENRO", `${lease.assignedPenro} / ${lease.assignedCenro}`],
    ["Remarks", lease.remarks || "—"],
  ];

  return (
    <section className="max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white">
      <dl className="divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-3 gap-4 px-4 py-2 text-sm">
            <dt className="font-medium text-slate-500">{label}</dt>
            <dd className="col-span-2 text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SimpleTable({
  headers,
  rows,
  emptyLabel,
}: {
  headers: string[];
  rows: string[][];
  emptyLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 text-left font-semibold text-slate-600">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2">{cell}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-4 py-6 text-center text-slate-400">
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
