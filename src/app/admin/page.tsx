"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import UploadModal from "@/components/UploadModal";
import EditModal from "@/components/EditModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import type { ContentItem } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = { VIDEO: "Video", PDF: "PDF", HTML: "Page" };

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AdminPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ContentItem | null>(null);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load content.");
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-ink">Manage content</h1>
            <p className="text-sm text-ink/60">Upload, edit, and remove videos, PDFs, and HTML pages.</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 rounded-md bg-accent text-white text-sm font-medium"
          >
            Upload content
          </button>
        </div>

        {error && <p className="text-sm text-danger mb-4">{error}</p>}

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-line/40 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-ink/50">
            Nothing uploaded yet. Click &quot;Upload content&quot; to add the first item.
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-white divide-y divide-line overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-accent bg-accent/10 rounded-sm px-1.5 py-0.5">
                      {TYPE_LABEL[item.type] || item.type}
                    </span>
                    {item.category && <span className="text-xs text-ink/40">{item.category}</span>}
                  </div>
                  <h3 className="font-medium text-ink truncate mt-1">{item.title}</h3>
                  <p className="text-xs text-ink/40 mt-0.5">{formatSize(item.size)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-1.5 rounded-md border border-line text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="px-3 py-1.5 rounded-md border border-danger/30 text-danger text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={(item) => {
            setItems((prev) => [item, ...prev]);
            setShowUpload(false);
          }}
        />
      )}

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
            setEditingItem(null);
          }}
        />
      )}

      {deletingItem && (
        <DeleteConfirmModal
          item={deletingItem}
          onClose={() => setDeletingItem(null)}
          onDeleted={(id) => {
            setItems((prev) => prev.filter((i) => i.id !== id));
            setDeletingItem(null);
          }}
        />
      )}
    </>
  );
}
