import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { getNotificationSettings } from "@/lib/data/settings";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user.role, "system:configure")) redirect("/dashboard");

  const settings = await getNotificationSettings();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Notification Settings</h1>
        <p className="text-sm text-slate-500">
          Configure how many days before the due date reminders go out, and when demand letters
          are generated for overdue leases.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
