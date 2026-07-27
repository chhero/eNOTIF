"use client";

import { useState } from "react";
import type { NotificationDoc } from "@/types";
import { PDFViewer } from "@/components/pdf/PDFViewer";

interface NotificationsTableProps {
  notifications: NotificationDoc[];
}

export function NotificationsTable({ notifications }: NotificationsTableProps) {
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Date</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">FLA No.</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Type</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Recipient</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <tr key={n.id}>
                <td className="px-4 py-2">
                  {new Date(n.sentDate).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-2 font-medium">{n.flaNumber}</td>
                <td className="px-4 py-2">{n.notificationType.replace(/_/g, " ")}</td>
                <td className="px-4 py-2 text-slate-600">{n.recipient}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      n.status === "SENT"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {n.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-col gap-1">
                    {n.pdfUrl && (
                      <button
                        onClick={() => setSelectedPdfUrl(n.pdfUrl!)}
                        className="inline-flex w-fit items-center gap-1 rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        📄 View PDF
                      </button>
                    )}
                    {n.error && (
                      <span className="text-xs font-medium text-red-600" title={n.error}>
                        Error: {n.error}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No notifications sent yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PDFViewer
        isOpen={!!selectedPdfUrl}
        onClose={() => setSelectedPdfUrl(null)}
        pdfUrl={selectedPdfUrl || ""}
        filename="demand-letter.pdf"
      />
    </>
  );
}
