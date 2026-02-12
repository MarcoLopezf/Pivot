import { Skeleton } from "@/components/ui/skeleton";

/**
 * LessonSkeleton - Loading placeholder for the Classroom (Lesson) page.
 *
 * Mimics the layout of VideoPlayer + item header + resources sidebar
 * to prevent layout shifts and provide instant shimmer feedback.
 */
export function LessonSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-40" />

      {/* Item Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4" />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Stage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Skeleton className="w-full aspect-video rounded-xl" />

          {/* Description Card */}
          <div className="space-y-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="space-y-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Resources Card */}
          <div className="space-y-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-1/3" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
