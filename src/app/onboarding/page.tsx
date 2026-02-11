"use client";

import { useEffect } from "react";
import { OnboardingLayout } from "@/interfaces/web/layouts/OnboardingLayout";
import { Step1Profile } from "@/interfaces/web/components/onboarding/steps/Step1Profile";
import { Step2Experience } from "@/interfaces/web/components/onboarding/steps/Step2Experience";
import { Step3Path } from "@/interfaces/web/components/onboarding/steps/Step3Path";
import { Step4DirectGoals } from "@/interfaces/web/components/onboarding/steps/Step4DirectGoals";
import { Step4Discovery } from "@/interfaces/web/components/onboarding/steps/Step4Discovery";
import { Step5Import } from "@/interfaces/web/components/onboarding/steps/Step5Import";
import { StepReview } from "@/interfaces/web/components/onboarding/steps/StepReview";
import { Step7Generating } from "@/interfaces/web/components/onboarding/steps/Step7Generating";
import { useOnboardingStore } from "@/interfaces/web/stores/useOnboardingStore";

/**
 * Onboarding Page - Main Entry Point for Onboarding Wizard
 *
 * Orchestrates the multi-step onboarding flow by rendering the correct
 * component based on the current step in the store.
 *
 * Flow:
 * 1. PROFILE - Collect basic identity information
 * 2. EXPERIENCE - Understand user's starting point
 * 3. PATH_SELECTION - Career goals and target role (TODO: Implement)
 *
 * Features:
 * - Automatic progress restoration from server
 * - Visual progress indicator
 * - Step-based component rendering
 * - Consistent layout across all steps
 *
 * @layer Interface (Web)
 */
export default function OnboardingPage() {
  const { step, isLoading, syncWithServer } = useOnboardingStore();

  /**
   * On mount, sync onboarding state from server
   * This restores progress if the user previously started onboarding
   */
  useEffect(() => {
    syncWithServer().catch((error) => {
      console.error("Failed to sync onboarding state:", error);
      // Continue with default state if sync fails
    });
  }, [syncWithServer]);

  /**
   * Renders the appropriate step component based on current step
   */
  const renderStep = (): React.ReactElement => {
    switch (step) {
      case "PROFILE":
        return <Step1Profile />;

      case "EXPERIENCE":
        return <Step2Experience />;

      case "PATH_SELECTION":
        return <Step3Path />;

      case "GOALS_DIRECT":
        return <Step4DirectGoals />;

      case "GOALS_DISCOVERY":
        return <Step4Discovery />;

      case "IMPORT":
        return <Step5Import />;

      case "REVIEW":
        return <StepReview />;

      case "ROADMAP_PREVIEW":
        return <Step7Generating />;

      default:
        // Safety fallback - render profile step if unknown step
        console.warn(
          `Unknown onboarding step: ${step}. Falling back to PROFILE.`,
        );
        return <Step1Profile />;
    }
  };

  return (
    <OnboardingLayout>
      {/* Loading State - Show skeleton while syncing with server */}
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-64 rounded bg-slate-200"></div>
              <div className="h-4 w-full rounded bg-slate-200"></div>
              <div className="h-4 w-5/6 rounded bg-slate-200"></div>
              <div className="mt-6 h-10 w-32 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>
      ) : (
        /* Current Step Component */
        renderStep()
      )}
    </OnboardingLayout>
  );
}
