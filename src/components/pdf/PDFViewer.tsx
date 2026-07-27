"use client";

import { useEffect } from "react";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename?: string;
}

export function PDFViewer({ isOpen, onClose, pdfUrl, filename = "document.pdf" }: PDFViewerProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full flex-col bg-white shadow-2xl sm:h-[90vh] sm:max-h-[90vh] sm:w-full sm:max-w-5xl sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">PDF Viewer</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href={pdfUrl}
              download={filename}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 sm:text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              📥 Download
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 underline hover:text-blue-700 sm:text-sm"
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center text-2xl font-bold text-slate-500 hover:text-slate-700"
            >
              ×
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="min-h-0 flex-1 overflow-hidden bg-slate-100">
          <iframe src={pdfUrl} className="h-full w-full border-0" title="PDF Viewer" />
        </div>
      </div>
    </div>
  );
}
