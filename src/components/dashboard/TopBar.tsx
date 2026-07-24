import { USER_ROLES } from "@/lib/constants";
import type { SessionUser } from "@/types";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export function TopBar({ user }: { user: SessionUser }) {
  const roleLabel =
    USER_ROLES.find((r) => r.value === user.role)?.label ?? user.role;
  const office = user.cenro ?? user.province ?? "Regional Office";

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
        <p className="text-xs text-slate-500">
          {roleLabel} &middot; {office}
        </p>
      </div>
      <LogoutButton />
    </header>
  );
}
