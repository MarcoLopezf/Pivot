import { Skeleton } from "@/components/ui/skeleton";

/**
 * TheorySkeleton - Loading placeholder for theory-type lesson pages.
 *
 * Mimics: full-width video + content/sources side-by-side + quiz section.
 */
export function TheorySkeleton(): React.ReactElement {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-36 bg-slate-200" />

      {/* Video Player */}
      <div className="rounded-xl overflow-hidden bg-[#1D2D50]">
        <div className="px-5 py-3">
          <Skeleton className="h-4 w-48 bg-[#133B5C]" />
        </div>
        <Skeleton className="w-full aspect-video bg-[#133B5C]/50" />
      </div>

      {/* Content: Description + Sources */}
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-8 w-3/4 bg-slate-200" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-slate-200/70" />
            <Skeleton className="h-4 w-5/6 bg-slate-200/70" />
            <Skeleton className="h-4 w-2/3 bg-slate-200/70" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
            <Skeleton className="h-6 w-16 rounded-full bg-slate-200" />
            <Skeleton className="h-6 w-24 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-3 w-28 bg-slate-200/70" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white"
            >
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0 bg-slate-200" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4 bg-slate-200/70" />
                <Skeleton className="h-3 w-1/2 bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Check */}
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-5 w-5 rounded bg-slate-200" />
          <Skeleton className="h-6 w-40 bg-slate-200" />
        </div>
        <Skeleton className="h-5 w-2/3 mb-6 bg-slate-200/70" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg bg-slate-100" />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Skeleton className="h-4 w-28 bg-slate-200/70" />
          <Skeleton className="h-10 w-32 rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Mark Complete */}
      <div className="flex justify-center">
        <Skeleton className="h-11 w-full max-w-md rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

/**
 * ProjectSkeleton - Loading placeholder for project-type lesson pages.
 *
 * Mimics: breadcrumb + title + two-column layout (objective/criteria + sidebar).
 */
export function ProjectSkeleton(): React.ReactElement {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-36 bg-slate-200" />

      {/* Header: breadcrumb + title + meta */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-32 bg-slate-200/70" />
        <Skeleton className="h-8 w-2/3 bg-slate-200" />
        <Skeleton className="h-4 w-48 bg-slate-200/70" />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-8">
          {/* Project Objective */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
              <Skeleton className="h-5 w-36 bg-slate-200" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-slate-200/70" />
              <Skeleton className="h-4 w-full bg-slate-200/70" />
              <Skeleton className="h-4 w-4/5 bg-slate-200/70" />
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
              <Skeleton className="h-5 w-44 bg-slate-200" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="h-4 w-4 rounded-full bg-slate-200 shrink-0" />
                <Skeleton className="h-4 w-full bg-slate-200/70" />
              </div>
            ))}
          </div>

          {/* Technical Stack */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
              <Skeleton className="h-5 w-32 bg-slate-200" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-7 w-20 rounded-full bg-slate-200/70"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evaluation Criteria dark card */}
          <div className="rounded-xl bg-[#1D2D50] p-5 space-y-4">
            <Skeleton className="h-3 w-28 bg-[#133B5C]" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="h-4 w-4 rounded-full bg-[#133B5C] shrink-0" />
                <Skeleton className="h-3.5 w-full bg-[#133B5C]" />
              </div>
            ))}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <Skeleton className="h-3 w-24 bg-[#133B5C]" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full bg-[#133B5C]" />
              ))}
            </div>
          </div>

          {/* Submit section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-36 bg-slate-200" />
            <Skeleton className="h-10 w-full rounded-md bg-slate-200/70" />
            <Skeleton className="h-10 w-full rounded-md bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * LessonSkeleton - Generic loading skeleton (used by loading.tsx before type is known).
 *
 * Shows a neutral layout that transitions smoothly into either theory or project.
 */
export function LessonSkeleton(): React.ReactElement {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-36 bg-slate-200" />

      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-32 bg-slate-200/70" />
        <Skeleton className="h-8 w-2/3 bg-slate-200" />
        <Skeleton className="h-4 w-48 bg-slate-200/70" />
      </div>

      {/* Two-column generic content */}
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-slate-200/70" />
            <Skeleton className="h-4 w-full bg-slate-200/70" />
            <Skeleton className="h-4 w-4/5 bg-slate-200/70" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-slate-200/70" />
            <Skeleton className="h-4 w-5/6 bg-slate-200/70" />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-40 w-full rounded-xl bg-slate-200/70" />
          <Skeleton className="h-10 w-full rounded-md bg-slate-200" />
          <Skeleton className="h-10 w-full rounded-md bg-slate-200/70" />
        </div>
      </div>
    </div>
  );
}
