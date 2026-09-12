"use client";

import { useState, FormEvent } from "react";
import { validateUpload } from "@/lib/validation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type { ContentItem } from "@/lib/types";

export default function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (item: ContentItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "preparing" | "uploading" | "saving">("idle");

  const busy = stage !== "idle";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    const localCheck = validateUpload(file.type, file.size);
    if (!localCheck.ok) {
      setError(localCheck.error);
      return;
    }

    try {
      setStage("preparing");
      const prepRes = await fetch("/api/admin/content/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
      });
      const prep = await prepRes.json();
      if (!prepRes.ok) throw new Error(prep.error || "Could not prepare the upload.");

      setStage("uploading");
      const { error: uploadError } = await supabaseBrowser.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "content")
        .uploadToSignedUrl(prep.storagePath, prep.token, file, { contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      setStage("saving");
      const saveRes = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          storagePath: prep.storagePath,
          mimeType: file.type,
          size: file.size,
        }),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) throw new Error(saved.error || "Could not save this item.");

      onUploaded(saved.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setStage("idle");
    }
  }

  const stageLabel: Record<string, string> = {
    preparing: "Preparing upload…",
    uploading: "Uploading file…",
    saving: "Saving details…",
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-20">
      <div className="w-full max-w-md rounded-lg bg-white border border-line p-6">
        <h2 className="font-semibold text-ink mb-4">Upload content</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-ink/70 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
              disabled={busy}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
              rows={2}
              disabled={busy}
            />
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-1">Category / tag</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
              disabled={busy}
            />
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-1">File (MP4, PDF, or HTML)</label>
            <input
              type="file"
              accept=".mp4,.pdf,.html,video/mp4,application/pdf,text/html"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
              disabled={busy}
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
          {busy && <p className="text-sm text-ink/50">{stageLabel[stage]}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-3 py-1.5 rounded-md border border-line text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-3 py-1.5 rounded-md bg-accent text-white text-sm disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
