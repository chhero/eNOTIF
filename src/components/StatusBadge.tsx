import { STATUS_BADGE_CLASSES } from "@/lib/constants";
import type { LeaseStatus } from "@/types";

export function StatusBadge({ status }: { status: LeaseStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[status]}`}
    >
      {status}
    </span>
  );
}
