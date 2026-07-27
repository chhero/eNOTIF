"use client";

import { useState } from "react";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename?: string;
}

export function PDFViewer({ isOpen, onClose, pdfUrl, filename = "document.pdf" }: PDFViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-lg flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">PDF Viewer</h2>
          <div className="flex gap-3 items-center">
            <a
              href={pdfUrl}
              download={filename}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              📥 Download
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-2xl font-bold h-8 w-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="flex-1 overflow-hidden bg-slate-100">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
          />
        </div>
      </div>
    </div>
  );
}
