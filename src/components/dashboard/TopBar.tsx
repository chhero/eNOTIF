import { USER_ROLES } from "@/lib/constants";
import type { SessionUser } from "@/types";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export function TopBar({
  user,
  onMenuClick,
}: {
  user: SessionUser;
  onMenuClick?: () => void;
}) {
  const roleLabel =
    USER_ROLES.find((r) => r.value === user.role)?.label ?? user.role;
  const office = user.cenro ?? user.province ?? "Regional Office";

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
          <p className="truncate text-xs text-slate-500">
            {roleLabel} &middot; {office}
          </p>
        </div>
      </div>
      <LogoutButton />
    </header>
  );
}
