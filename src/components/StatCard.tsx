import type { ComponentType, SVGProps } from "react";

export function StatCard({
  label,
  value,
  accent,
  icon: Icon,
  hero = false,
}: {
  label: string;
  value: string | number;
  accent?: "default" | "warning" | "danger" | "success";
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  hero?: boolean;
}) {
  const accentStyles = {
    default: { text: "text-slate-900", bg: "bg-slate-100", icon: "text-slate-600" },
    warning: { text: "text-amber-600", bg: "bg-amber-50", icon: "text-amber-600" },
    danger: { text: "text-red-600", bg: "bg-red-50", icon: "text-red-600" },
    success: { text: "text-green-700", bg: "bg-green-50", icon: "text-green-700" },
  }[accent ?? "default"];

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${
        hero ? "sm:p-6" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p
          className={`mt-1 font-bold ${accentStyles.text} ${
            hero ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          {value}
        </p>
      </div>
      {Icon && (
        <span className={`shrink-0 rounded-full p-2 ${accentStyles.bg}`}>
          <Icon className={`h-5 w-5 ${accentStyles.icon}`} />
        </span>
      )}
    </div>
  );
}
