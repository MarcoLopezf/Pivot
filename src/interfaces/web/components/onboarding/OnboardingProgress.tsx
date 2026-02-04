"use client";

import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/interfaces/web/stores/useOnboardingStore";

/**
 * OnboardingProgress - Visual progress indicator for onboarding wizard
 *
 * Displays the current step number and a visual progress bar
 * to help users understand their position in the onboarding flow.
 *
 * Automatically syncs with the onboarding store state.
 *
 * @layer Interface (Web)
 */

export function OnboardingProgress() {
  const { currentStep, totalSteps } = useOnboardingStore();

  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      {/* Step indicator text */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-sm font-medium text-muted-foreground">
          {Math.round(progressPercentage)}%
        </p>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
