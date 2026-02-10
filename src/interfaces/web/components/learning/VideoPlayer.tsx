"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * VideoPlayer Component
 *
 * Renders a responsive YouTube embed iframe or a placeholder if no valid URL.
 * Supports standard, shortened, embed, and shorts YouTube URL formats.
 */
export function VideoPlayer({
  videoUrl,
  title,
}: VideoPlayerProps): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoId = extractYouTubeId(videoUrl);

  if (!videoId) {
    return (
      <div className="aspect-video rounded-lg bg-gray-100 flex flex-col items-center justify-center text-gray-400">
        <PlayCircle className="h-16 w-16 mb-3" />
        <p className="text-sm font-medium">No video available</p>
        <p className="text-xs mt-1">Resources will appear below</p>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black relative">
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
      )}
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`w-full h-full transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
