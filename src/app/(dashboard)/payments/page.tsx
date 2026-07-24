import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listLeasesForUser } from "@/lib/data/leases";
import { listPaymentsForUser } from "@/lib/data/payments";
import { can } from "@/lib/rbac";
import { PaymentForm } from "@/components/payments/PaymentForm";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user.role, "payments:view")) redirect("/dashboard");

  const [leases, payments] = await Promise.all([
    listLeasesForUser(user),
    listPaymentsForUser(user),
  ]);

  const payableLeases = leases.filter((l) => l.status !== "PAID");
  const canRecord = can(user.role, "payments:record");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-500">
          Record and monitor annual rental collections
        </p>
      </div>

      {canRecord && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Record New Payment
          </h2>
          {payableLeases.length > 0 ? (
            <PaymentForm leases={payableLeases} />
          ) : (
            <p className="text-sm text-slate-500">No leases currently awaiting payment.</p>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent Payments
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">FLA No.</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Amount</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Date</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Receipt No.</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Cashier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2">{p.flaNumber}</td>
                  <td className="px-4 py-2">
                    {p.amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                  </td>
                  <td className="px-4 py-2">{p.paymentDate}</td>
                  <td className="px-4 py-2">{p.receiptNumber}</td>
                  <td className="px-4 py-2">{p.cashierName}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
