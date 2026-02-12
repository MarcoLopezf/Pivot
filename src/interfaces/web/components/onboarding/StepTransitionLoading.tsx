import { Progress } from "@/components/ui/progress";

/**
 * StepTransitionLoading - Full-screen loading transition between onboarding steps
 *
 * Two-column layout matching StepContainer:
 * - Left panel: Dark blue gradient with ambient teal glow orb
 * - Right panel: Progress bar, skeleton placeholders, and transition message
 *
 * @layer Interface (Web)
 */

interface StepTransitionLoadingProps {
  currentStep: number;
  totalSteps?: number;
}

export function StepTransitionLoading({
  currentStep,
  totalSteps = 7,
}: StepTransitionLoadingProps): React.ReactElement {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full">
      {/* Left Panel - Ambient Glow */}
      <div className="hidden md:flex md:w-2/5 xl:w-5/12 bg-gradient-to-br from-[#1D2D50] via-[#1D2D50] to-[#133B5C] items-center justify-center">
        {/* Teal radial glow orb */}
        <div className="relative h-64 w-64">
          <div className="absolute inset-0 rounded-full bg-[#1E5F74]/40 blur-[80px]" />
          <div className="absolute inset-8 rounded-full bg-[#1E5F74]/25 blur-[50px]" />
          <div className="absolute inset-16 rounded-full bg-[#4DC9F6]/15 blur-[30px]" />
        </div>
      </div>

      {/* Right Panel - Skeletons + Message */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        <div className="flex flex-col h-full max-w-2xl w-full mx-auto px-6 md:px-8 xl:px-12">
          {/* Progress Bar - Animated */}
          <div className="pt-8 xl:pt-12 pb-4 space-y-2 flex-shrink-0">
            <Progress
              value={progressPercentage}
              className="h-1.5 bg-slate-200 [&>div]:bg-[#1E5F74] [&>div]:transition-all [&>div]:duration-500"
            />
          </div>

          {/* Skeleton Form Placeholders */}
          <div className="flex-1 flex flex-col justify-center space-y-6 animate-pulse">
            {/* Title skeleton */}
            <div className="space-y-3">
              <div className="h-7 w-3/5 rounded-md bg-slate-200" />
              <div className="h-4 w-2/5 rounded bg-slate-100" />
            </div>

            {/* Label + Input skeleton 1 */}
            <div className="space-y-2">
              <div className="h-3.5 w-24 rounded bg-slate-200" />
              <div className="h-10 w-full rounded-md bg-slate-200" />
            </div>

            {/* Label + Input skeleton 2 */}
            <div className="space-y-2">
              <div className="h-3.5 w-32 rounded bg-slate-200" />
              <div className="h-10 w-full rounded-md bg-slate-200" />
            </div>

            {/* Label + Input skeleton 3 */}
            <div className="space-y-2">
              <div className="h-3.5 w-28 rounded bg-slate-200" />
              <div className="h-10 w-full rounded-md bg-slate-200" />
            </div>

            {/* Toggle/button skeleton */}
            <div className="h-8 w-20 rounded-full bg-slate-200" />
          </div>

          {/* Transition Message - Fixed bottom */}
          <div className="pb-10 pt-6 text-center flex-shrink-0">
            <p className="text-lg font-semibold text-[#1D2D50] tracking-tight">
              Crafting your personalized path...
            </p>
            <p className="mt-1.5 text-sm text-slate-400">
              Our AI is analyzing your inputs to build a custom dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
