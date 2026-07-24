export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "default" | "warning" | "danger" | "success";
}) {
  const accentClass = {
    default: "text-slate-900",
    warning: "text-amber-600",
    danger: "text-red-600",
    success: "text-green-700",
  }[accent ?? "default"];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${accentClass}`}>{value}</p>
    </div>
  );
}
