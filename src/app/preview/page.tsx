"use client";

import { useEffect } from "react";
import { DocumentPreview } from "@/components/template/document-preview";

export default function PreviewPage() {
  useEffect(() => {
    // Auto-trigger print dialog after a short delay to let content render
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx global>{`
        @media screen {
          body {
            background: #e5e7eb;
            margin: 0;
            padding: 2rem 0;
          }
          .print-hint {
            display: block;
          }
        }
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          .print-hint {
            display: none !important;
          }
          .preview-container {
            box-shadow: none !important;
            max-width: none !important;
            margin: 0 !important;
          }
        }
        @page {
          margin: 2cm;
          size: A4;
        }
      `}</style>
      <div className="print-hint fixed top-4 right-4 z-50 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg">
        Use <strong>Ctrl+P</strong> (or Cmd+P) to save as PDF
      </div>
      <div className="preview-container">
        <DocumentPreview />
      </div>
    </>
  );
}
