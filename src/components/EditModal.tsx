"use client";

import { useState, FormEvent } from "react";
import type { ContentItem } from "@/lib/types";

export default function EditModal({
  item,
  onClose,
  onSaved,
}: {
  item: ContentItem;
  onClose: () => void;
  onSaved: (item: ContentItem) => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || "");
  const [category, setCategory] = useState(item.category || "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save changes.");
      onSaved(data.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-20">
      <div className="w-full max-w-md rounded-lg bg-white border border-line p-6">
        <h2 className="font-semibold text-ink mb-4">Edit details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-ink/70 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
              disabled={saving}
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
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-1">Category / tag</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
              disabled={saving}
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3 py-1.5 rounded-md border border-line text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 rounded-md bg-accent text-white text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
