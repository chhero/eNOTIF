"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types";
import { can } from "@/lib/rbac";

const NAV_ITEMS: {
  href: string;
  label: string;
  show: (role: UserRole) => boolean;
}[] = [
  { href: "/dashboard", label: "Dashboard", show: () => true },
  { href: "/leases", label: "Leases", show: () => true },
  {
    href: "/payments",
    label: "Payments",
    show: (role) => can(role, "payments:view"),
  },
  {
    href: "/notifications",
    label: "Notifications",
    show: () => true,
  },
  {
    href: "/reports",
    label: "Reports & Analytics",
    show: (role) => can(role, "reports:generate"),
  },
  {
    href: "/users",
    label: "User Management",
    show: (role) => can(role, "users:manage"),
  },
  {
    href: "/penros",
    label: "PENRO Management",
    show: (role) => can(role, "penro:manage"),
  },
  {
    href: "/cenros",
    label: "CENRO Management",
    show: (role) => can(role, "cenro:manage"),
  },
  {
    href: "/audit-logs",
    label: "Audit Logs",
    show: (role) => can(role, "audit:view"),
  },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-lg font-bold text-green-800">eNOTIF</p>
        <p className="text-xs text-slate-500">DENR Region VIII</p>
      </div>
      <ul className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.filter((item) => item.show(role)).map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-700 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
