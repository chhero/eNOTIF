"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserStatus } from "@/types";

export function UserStatusToggle({ userId, status }: { userId: string; status: UserStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const nextStatus: UserStatus = status === "active" ? "disabled" : "active";

  async function handleToggle() {
    setLoading(true);
    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-md px-3 py-1 text-xs font-medium disabled:opacity-60 ${
        status === "active"
          ? "border border-red-300 text-red-600 hover:bg-red-50"
          : "border border-green-300 text-green-700 hover:bg-green-50"
      }`}
    >
      {loading ? "..." : status === "active" ? "Disable" : "Enable"}
    </button>
  );
}
