"use client";

import { useEffect, useState } from "react";

export function useSignedUrl(contentId: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/content/${contentId}/signed-url`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Could not load this item.");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setUrl(data.url);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contentId]);

  return { url, error, loading };
}
