// Plain string-literal union (not imported from @prisma/client) so this file can be
// safely imported from both server code and client components - @prisma/client's
// runtime is Node-only and would break a browser bundle.
export type ContentTypeValue = "VIDEO" | "PDF" | "HTML";

export const ALLOWED_MIME_TYPES: Record<string, { type: ContentTypeValue; maxBytes: number; extension: string }> = {
  "video/mp4": { type: "VIDEO", maxBytes: 200 * 1024 * 1024, extension: "mp4" },
  "application/pdf": { type: "PDF", maxBytes: 25 * 1024 * 1024, extension: "pdf" },
  "text/html": { type: "HTML", maxBytes: 2 * 1024 * 1024, extension: "html" },
};

export function validateUpload(mimeType: string, size: number) {
  const rule = ALLOWED_MIME_TYPES[mimeType];
  if (!rule) {
    return {
      ok: false as const,
      error: `Unsupported file type "${mimeType}". Allowed types: MP4 video, PDF, HTML.`,
    };
  }
  if (size <= 0) {
    return { ok: false as const, error: "File is empty." };
  }
  if (size > rule.maxBytes) {
    const maxMb = Math.round(rule.maxBytes / (1024 * 1024));
    return { ok: false as const, error: `File exceeds the ${maxMb}MB limit for this content type.` };
  }
  return { ok: true as const, contentType: rule.type, extension: rule.extension };
}
