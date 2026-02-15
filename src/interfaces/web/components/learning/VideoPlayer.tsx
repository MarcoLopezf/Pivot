"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  breadcrumb?: {
    trackName: string;
    moduleName: string;
  };
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
 * Renders a responsive YouTube embed with a navy (#1D2D50) container
 * and optional breadcrumb overlay at the top.
 */
export function VideoPlayer({
  videoUrl,
  title,
  breadcrumb,
}: VideoPlayerProps): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoId = extractYouTubeId(videoUrl);

  return (
    <div className="rounded-xl overflow-hidden bg-[#1D2D50] shadow-lg">
      {/* Breadcrumb overlay */}
      {breadcrumb && (
        <div className="px-5 py-3">
          <p className="text-sm text-slate-400">
            <span>{breadcrumb.trackName}</span>
            <span className="mx-2 text-slate-500">/</span>
            <span className="text-slate-300">{breadcrumb.moduleName}</span>
          </p>
        </div>
      )}

      {/* Video area */}
      {videoId ? (
        <div className="aspect-video relative bg-black/20">
          {!isLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full bg-[#133B5C]/50" />
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
      ) : (
        <div className="aspect-video flex flex-col items-center justify-center bg-[#133B5C]/30">
          <div className="w-16 h-16 rounded-full bg-[#FCDAB7]/20 flex items-center justify-center mb-3">
            <PlayCircle className="h-8 w-8 text-[#FCDAB7]" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            No video available
          </p>
          <p className="text-xs mt-1 text-slate-400">
            Resources will appear below
          </p>
        </div>
      )}
    </div>
  );
}
