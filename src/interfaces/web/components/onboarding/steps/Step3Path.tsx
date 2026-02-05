"use client";

import { useState } from "react";
import { StepContainer } from "@/interfaces/web/components/onboarding/StepContainer";
import {
  useOnboardingStore,
  type OnboardingPath,
} from "@/interfaces/web/stores/useOnboardingStore";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Compass } from "lucide-react";
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
   * Updates store and navigates to the appropriate next step
   */
  const handlePathSelection = async (path: OnboardingPath): Promise<void> => {
    try {
      setSelectedPath(path);

      // Update store with selected path
      updateData({ path });

      // Save progress to server
      await saveCurrentStep();

      // Navigate to appropriate next step based on path
      if (path === "DIRECT") {
        setStep("GOALS_DIRECT");
      } else {
        setStep("GOALS_DISCOVERY");
      }
    } catch (error) {
      console.error("Error saving path selection:", error);
      setSelectedPath(null);
      // TODO: Show error toast to user
    }
  };

  return (
    <StepContainer
      title="Choose your path"
      description="How would you like to approach your career planning?"
      onNext={() => {
        // This step doesn't use the Next button - selection is automatic
      }}
      onBack={previousStep}
      isNextDisabled={true}
      isLoading={isLoading}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Option A: Direct Path - I know my destination */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary hover:shadow-md",
            selectedPath === "DIRECT" && "border-primary shadow-md",
            isLoading && "pointer-events-none opacity-50",
          )}
          onClick={() => !isLoading && handlePathSelection("DIRECT")}
        >
          <CardContent className="flex flex-col items-center space-y-4 p-6 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">
                I have a specific role in mind
              </h3>
              <p className="text-sm text-muted-foreground">
                I know exactly what I want to become (e.g., React Developer,
                Data Analyst, UX Designer).
              </p>
            </div>
            <div className="rounded-lg bg-muted px-3 py-1 text-xs font-medium">
              Direct Path
            </div>
          </CardContent>
        </Card>

        {/* Option B: Discovery Path - Help me explore */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary hover:shadow-md",
            selectedPath === "DISCOVERY" && "border-primary shadow-md",
            isLoading && "pointer-events-none opacity-50",
          )}
          onClick={() => !isLoading && handlePathSelection("DISCOVERY")}
        >
          <CardContent className="flex flex-col items-center space-y-4 p-6 text-center">
            <div className="rounded-full bg-purple-500/10 p-4">
              <Compass className="h-8 w-8 text-purple-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Help me discover</h3>
              <p className="text-sm text-muted-foreground">
                I&apos;m not sure yet. Analyze my profile and interests to
                suggest roles that might fit me.
              </p>
            </div>
            <div className="rounded-lg bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600">
              Discovery Path
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Helper Text */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t worry, you can always adjust your goals later.
      </div>
    </StepContainer>
  );
}
