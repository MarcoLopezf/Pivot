"use client";

import { useState } from "react";
import { StepContainer } from "@/interfaces/web/components/onboarding/StepContainer";
import {
  useOnboardingStore,
  type OnboardingPath,
} from "@/interfaces/web/stores/useOnboardingStore";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Step3Path - Onboarding Step 3: Path Selection
 *
 * Lets the user choose their onboarding strategy:
 * - DIRECT: User knows exactly what role they want
 * - DISCOVERY: User needs help discovering the right path
 *
 * This creates a branching flow:
 * - DIRECT → Step4DirectGoals
 * - DISCOVERY → Step4Discovery
 *
 * @layer Interface (Web)
 */

export function Step3Path() {
  const { updateData, saveCurrentStep, setStep, previousStep, isLoading } =
    useOnboardingStore();

  const [selectedPath, setSelectedPath] = useState<OnboardingPath | null>(null);

  /**
   * Handles path selection
   * Sets the selected path in local state (doesn't navigate yet)
   */
  const handlePathSelection = (path: OnboardingPath): void => {
    setSelectedPath(path);
    updateData({ path });
  };

  /**
   * Handles Continue button click
   * Saves progress and navigates to appropriate next step
   */
  const handleContinue = async (): Promise<void> => {
    if (!selectedPath) return;

    try {
      // Save progress to server
      await saveCurrentStep();

      // Navigate to appropriate next step based on path
      if (selectedPath === "DIRECT") {
        setStep("GOALS_DIRECT");
      } else {
        setStep("GOALS_DISCOVERY");
      }
    } catch (error) {
      console.error("Error saving path selection:", error);
      // TODO: Show error toast to user
    }
  };

  return (
    <StepContainer
      currentStep={3}
      title="Choose your path"
      description="How would you like to approach your career planning?"
      quote="The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle."
      quoteAuthor="STEVE JOBS"
      onNext={handleContinue}
      onBack={previousStep}
      isNextDisabled={!selectedPath}
      isLoading={isLoading}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Option A: Direct Path - I know my destination */}
        <Card
          className={cn(
            "relative cursor-pointer transition-all rounded-3xl bg-white",
            selectedPath === "DIRECT"
              ? "border-2 border-[#1E5F74] shadow-md"
              : "border border-slate-200 hover:border-slate-300 hover:shadow-sm",
            isLoading && "pointer-events-none opacity-50",
          )}
          onClick={() => !isLoading && handlePathSelection("DIRECT")}
        >
          {/* Selection Badge - Top Right */}
          {selectedPath === "DIRECT" && (
            <div className="absolute top-4 right-4 bg-[#1E5F74] rounded-full p-1.5">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}

          <CardContent className="flex flex-col items-center p-8 text-center h-full">
            <div className="flex flex-col items-center space-y-4 flex-1">
              <div className="rounded-full bg-slate-100 p-4">
                <Target className="h-8 w-8 text-slate-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  I have a specific role in mind
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  I know exactly what I want to become (e.g., React Developer,
                  Data Analyst, UX Designer).
                </p>
              </div>
            </div>
            <div className="text-xs font-medium text-slate-600 bg-slate-100 px-4 py-1.5 rounded-full mt-6">
              Direct Path
            </div>
          </CardContent>
        </Card>

        {/* Option B: Discovery Path - Help me explore */}
        <Card
          className={cn(
            "relative cursor-pointer transition-all rounded-3xl bg-white",
            selectedPath === "DISCOVERY"
              ? "border-2 border-purple-500 shadow-md"
              : "border border-slate-200 hover:border-slate-300 hover:shadow-sm",
            isLoading && "pointer-events-none opacity-50",
          )}
          onClick={() => !isLoading && handlePathSelection("DISCOVERY")}
        >
          {/* Selection Badge - Top Right */}
          {selectedPath === "DISCOVERY" && (
            <div className="absolute top-4 right-4 bg-purple-500 rounded-full p-1.5">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}

          <CardContent className="flex flex-col items-center p-8 text-center h-full">
            <div className="flex flex-col items-center space-y-4 flex-1">
              <div className="rounded-full bg-purple-50 p-4">
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Help me discover
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  I&apos;m not sure yet. Analyze my profile and interests to
                  suggest roles that might fit me.
                </p>
              </div>
            </div>
            <div className="text-xs font-medium text-purple-500 bg-purple-100 px-4 py-1.5 rounded-full mt-6">
              Discovery Path
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Helper Text */}
      <div className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t worry, you can always adjust your goals later.
      </div>
    </StepContainer>
  );
}
