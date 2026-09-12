"use client";

import { useState } from "react";
import type { ContentItem } from "@/lib/types";

export default function DeleteConfirmModal({
  item,
  onClose,
  onDeleted,
}: {
  item: ContentItem;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText.trim() === item.title.trim();

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/content/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete this item.");
      onDeleted(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-20">
      <div className="w-full max-w-md rounded-lg bg-white border border-line p-6">
        <h2 className="font-semibold text-ink mb-2">Delete &quot;{item.title}&quot;?</h2>
        <p className="text-sm text-ink/60 mb-4">
          This permanently removes the file and its listing. Type the title below to confirm.
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={item.title}
          className="w-full rounded-md border border-line px-3 py-2 text-sm mb-2"
          disabled={deleting}
        />
        {error && <p className="text-sm text-danger mb-2">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={deleting} className="px-3 py-1.5 rounded-md border border-line text-sm">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="px-3 py-1.5 rounded-md bg-danger text-white text-sm disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
