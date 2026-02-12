import { Skeleton } from "@/components/ui/skeleton";

export function RoadmapSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Header Skeleton */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="bg-[#1D2D50] rounded-xl px-6 md:px-8 py-8 space-y-4">
          <Skeleton className="h-4 w-24 bg-slate-600" />
          <Skeleton className="h-10 w-2/3 bg-slate-600" />
          <Skeleton className="h-4 w-1/2 bg-slate-600" />
          <Skeleton className="h-2 w-full bg-slate-600 rounded-full" />
          {/* Stats row */}
          <div className="flex gap-6 pt-2">
            <Skeleton className="h-12 w-32 bg-slate-600" />
            <Skeleton className="h-12 w-32 bg-slate-600" />
            <Skeleton className="h-12 w-32 bg-slate-600" />
          </div>
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-6">
            <Skeleton className="h-10 w-10 rounded-full shrink-0 bg-slate-200" />
            <Skeleton className="h-32 w-full rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
