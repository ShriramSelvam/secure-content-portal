"use client";

import { useSignedUrl } from "@/lib/useSignedUrl";
import { ViewerSkeleton, ViewerError } from "./ViewerStates";

export default function HtmlViewer({ contentId }: { contentId: string }) {
  const { url, error, loading } = useSignedUrl(contentId);

  if (loading) return <ViewerSkeleton />;
  if (error || !url) return <ViewerError message={error || "Could not load this page."} />;

  return (
    <iframe
      key={url}
      src={url}
      // allow-scripts only: no allow-same-origin (can't read cookies or reach the parent app),
      // no allow-downloads, no allow-top-navigation.
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      className="w-full h-[70vh] rounded-lg border border-line bg-white"
      title="Content"
    />
  );
}
