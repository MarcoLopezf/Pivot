"use client";

import * as React from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * VideoCard Component Props
 */
interface VideoCardProps {
  title: string;
  thumbnailUrl: string;
  channelName: string;
  videoUrl: string;
  duration?: string;
}

/**
 * VideoCard Component
 *
 * A polished video card component that displays YouTube video information.
 * Uses the "Facade Pattern" where the entire card acts as a link to the video.
 *
 * Features:
 * - Hover effects with image scaling and play icon overlay
 * - Aspect ratio preserved thumbnail (16:9)
 * - Duration badge (if provided)
 * - Clean, accessible design
 *
 * @example
 * ```tsx
 * <VideoCard
 *   title="Learn React Hooks in 30 Minutes"
 *   thumbnailUrl="https://i.ytimg.com/vi/xyz/maxresdefault.jpg"
 *   channelName="Fireship"
 *   videoUrl="https://youtube.com/watch?v=xyz"
 *   duration="10:05"
 * />
 * ```
 */
export function VideoCard({
  title,
  thumbnailUrl,
  channelName,
  videoUrl,
  duration,
}: VideoCardProps): React.ReactElement {
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full transition-transform hover:scale-[1.02]"
    >
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        {/* Thumbnail Section with Overlay */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {/* Thumbnail Image */}
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Dark Overlay on Hover */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40" />

          {/* Play Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
          </div>

          {/* Duration Badge */}
          {duration && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 bg-black/80 text-xs font-semibold text-white hover:bg-black/80"
            >
              {duration}
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          <h3
            className="mb-2 line-clamp-2 text-base font-semibold leading-tight text-foreground"
            title={title}
          >
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{channelName}</p>
        </CardContent>
      </Card>
    </a>
  );
}
