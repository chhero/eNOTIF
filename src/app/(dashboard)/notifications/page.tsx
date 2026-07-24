import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listNotificationsForUser } from "@/lib/data/notifications";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await listNotificationsForUser(user);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500">
          Automated reminders and demand letters sent by the daily scheduler
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Date</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">FLA No.</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Type</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Recipient</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <tr key={n.id}>
                <td className="px-4 py-2">{n.sentDate}</td>
                <td className="px-4 py-2">{n.flaNumber}</td>
                <td className="px-4 py-2">{n.notificationType.replace(/_/g, " ")}</td>
                <td className="px-4 py-2">{n.recipient}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      n.status === "SENT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {n.status}
                  </span>
                </td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No notifications sent yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
