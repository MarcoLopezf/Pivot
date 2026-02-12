import { Skeleton } from "@/components/ui/skeleton";

/**
 * RoadmapSkeleton - Loading placeholder for the Roadmap Overview page.
 *
 * Mimics the layout of RoadmapHeader + RoadmapStats + RoadmapTimeline
 * to prevent layout shifts and provide instant shimmer feedback.
 */
export function RoadmapSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
        <div className="flex items-center gap-3 mt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-8 w-8 rounded-full shrink-0 mt-2" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
