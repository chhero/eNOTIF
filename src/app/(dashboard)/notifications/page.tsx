import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listNotificationsForUser } from "@/lib/data/notifications";
import { NotificationsTable } from "@/components/notifications/NotificationsTable";

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

      <NotificationsTable notifications={notifications} />
    </div>
  );
}
