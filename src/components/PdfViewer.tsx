"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useSignedUrl } from "@/lib/useSignedUrl";
import { ViewerSkeleton, ViewerError } from "./ViewerStates";

// Load the PDF.js worker from a CDN matching the bundled pdfjs-dist version,
// so we don't have to vendor the worker file ourselves.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ contentId }: { contentId: string }) {
  const { url, error, loading } = useSignedUrl(contentId);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  if (loading) return <ViewerSkeleton />;
  if (error || !url) return <ViewerError message={error || "Could not load this document."} />;

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      <div className="rounded-lg border border-line bg-white overflow-auto flex justify-center p-4">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<ViewerSkeleton />}
          error={<ViewerError message="Could not render this PDF." />}
        >
          {/* No text or annotation layer: renders as a flat image, no selectable/copyable text,
              and there's no native browser PDF toolbar (with its download/print buttons) since
              we never link directly to the PDF binary. */}
          <Page pageNumber={page} renderTextLayer={false} renderAnnotationLayer={false} width={640} />
        </Document>
      </div>

      {numPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded-md border border-line disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-ink/60">
            Page {page} of {numPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
            className="px-3 py-1 rounded-md border border-line disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
