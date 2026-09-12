"use client";

import { useSignedUrl } from "@/lib/useSignedUrl";
import { ViewerSkeleton, ViewerError } from "./ViewerStates";

export default function VideoPlayer({ contentId }: { contentId: string }) {
  const { url, error, loading } = useSignedUrl(contentId);

  if (loading) return <ViewerSkeleton />;
  if (error || !url) return <ViewerError message={error || "Could not load this video."} />;

  return (
    <video
      key={url}
      controls
      controlsList="nodownload noremoteplayback"
      onContextMenu={(e) => e.preventDefault()}
      className="w-full rounded-lg bg-black aspect-video"
    >
      <source src={url} type="video/mp4" />
      Your browser doesn&apos;t support video playback.
    </video>
  );
}
