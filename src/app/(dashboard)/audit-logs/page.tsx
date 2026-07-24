import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { listAuditLogs } from "@/lib/data/audit";

export default async function AuditLogsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user.role, "audit:view")) redirect("/dashboard");

  const logs = await listAuditLogs();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500">System-wide record of user actions</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Date/Time</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">User</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Action</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(log.dateTime).toLocaleString()}</td>
                <td className="px-4 py-2">{log.userName}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2 text-slate-500">{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No audit log entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
