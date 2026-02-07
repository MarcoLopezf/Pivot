"use client";

import { useState } from "react";
import { StepContainer } from "../StepContainer";
import { useOnboardingStore } from "@interfaces/web/stores/useOnboardingStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, Target, Compass, Pencil } from "lucide-react";

/**
 * StepReview - Summary/Confirmation Step before roadmap generation
 *
 * Displays a summary of all collected onboarding data so the user
 * can review and confirm before the AI generates their roadmap.
 *
 * @layer Interface (Web)
 */
export function StepReview(): React.ReactElement {
  const { data, previousStep, saveCurrentStep, nextStep, goToStep } =
    useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await saveCurrentStep();
      nextStep();
    } catch (err) {
      console.error("Error advancing to generation:", err);
      setError(err instanceof Error ? err.message : "Failed to save progress");
      setIsLoading(false);
    }
  };

  const handleEdit = (): void => {
    goToStep(1);
  };

  const experienceLabel = formatExperience(data.yearsExperience);
  const isDirectPath = data.path === "DIRECT";

  return (
    <StepContainer
      title="Ready to launch your career?"
      description="Review your details to ensure the AI builds the perfect path for you."
      onNext={handleGenerate}
      onBack={previousStep}
      isLoading={isLoading}
      nextLabel="Generate Roadmap"
    >
      <div className="space-y-6">
        {/* Summary Card */}
        <Card className="border-2">
          <CardContent className="space-y-5 pt-6">
            {/* Name & Region */}
            <SummaryRow
              icon={<User className="h-5 w-5 text-blue-600" />}
              label="Name"
              value={data.name as string | undefined}
            />
            <SummaryRow
              icon={<MapPin className="h-5 w-5 text-blue-600" />}
              label="Region"
              value={data.region as string | undefined}
            />

            <div className="border-t" />

            {/* Target Role */}
            <SummaryRow
              icon={<Target className="h-5 w-5 text-purple-600" />}
              label="Target Role"
              value={data.targetRole as string | undefined}
              highlight
            />

            {/* Experience */}
            <SummaryRow
              icon={<Briefcase className="h-5 w-5 text-green-600" />}
              label="Experience"
              value={
                data.currentRole
                  ? `${data.currentRole as string}${experienceLabel ? ` (${experienceLabel})` : ""}`
                  : experienceLabel || undefined
              }
            />

            {/* Career Goal / Path Info */}
            {isDirectPath && data.targetSeniority && (
              <>
                <div className="border-t" />
                <SummaryRow
                  icon={<Compass className="h-5 w-5 text-amber-600" />}
                  label="Target Level"
                  value={data.targetSeniority as string}
                />
              </>
            )}

            {!isDirectPath && data.interests && (
              <>
                <div className="border-t" />
                <SummaryRow
                  icon={<Compass className="h-5 w-5 text-amber-600" />}
                  label="Interests"
                  value={data.interests as string}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="gap-2 text-muted-foreground"
          >
            <Pencil className="h-4 w-4" />
            Edit from the beginning
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </StepContainer>
  );
}

/**
 * Formats years of experience into a readable label
 */
function formatExperience(years: unknown): string | undefined {
  if (years === undefined || years === null) return undefined;
  const num = Number(years);
  if (num === 0) return "Student / No experience";
  if (num === 1) return "1 year";
  return `${num} years`;
}

/**
 * Reusable row for the summary card
 */
function SummaryRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  highlight?: boolean;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`truncate ${highlight ? "text-base font-semibold" : "text-sm font-medium"}`}
        >
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}
