"use client";

import { useState } from "react";
import { StepContainer } from "../StepContainer";
import { useOnboardingStore } from "@interfaces/web/stores/useOnboardingStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  Briefcase,
  Target,
  Compass,
  Pencil,
  FileText,
} from "lucide-react";

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

  const experienceLabel = formatExperience(data.yearsExperience);
  const isDirectPath = data.path === "DIRECT";
  const resumePreview =
    data.resumeText && typeof data.resumeText === "string"
      ? data.resumeText.length > 200
        ? `${data.resumeText.slice(0, 200)}...`
        : data.resumeText
      : undefined;

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
            {/* Name & Region → Step 1 */}
            <SummarySection onEdit={() => goToStep(1)}>
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
            </SummarySection>

            <div className="border-t" />

            {/* Target Role → Step 4 */}
            <SummarySection onEdit={() => goToStep(4)}>
              <SummaryRow
                icon={<Target className="h-5 w-5 text-purple-600" />}
                label="Target Role"
                value={data.targetRole as string | undefined}
                highlight
              />
              {isDirectPath && data.targetSeniority && (
                <SummaryRow
                  icon={<Compass className="h-5 w-5 text-amber-600" />}
                  label="Target Level"
                  value={data.targetSeniority as string}
                />
              )}
              {!isDirectPath && data.interests && (
                <SummaryRow
                  icon={<Compass className="h-5 w-5 text-amber-600" />}
                  label="Interests"
                  value={data.interests as string}
                />
              )}
            </SummarySection>

            <div className="border-t" />

            {/* Experience → Step 2 */}
            <SummarySection onEdit={() => goToStep(2)}>
              <SummaryRow
                icon={<Briefcase className="h-5 w-5 text-green-600" />}
                label="Experience"
                value={
                  data.currentRole
                    ? `${data.currentRole as string}${experienceLabel ? ` (${experienceLabel})` : ""}`
                    : experienceLabel || undefined
                }
              />
            </SummarySection>

            {/* Resume → Step 5 */}
            {resumePreview && (
              <>
                <div className="border-t" />
                <SummarySection onEdit={() => goToStep(5)}>
                  <SummaryRow
                    icon={<FileText className="h-5 w-5 text-cyan-600" />}
                    label="Resume"
                    value={data.resumeFileName as string | undefined}
                  />
                  <p className="ml-12 text-xs leading-relaxed text-muted-foreground">
                    {resumePreview}
                  </p>
                </SummarySection>
              </>
            )}
          </CardContent>
        </Card>

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
 * Wraps a group of summary rows with an inline edit (pencil) button
 */
function SummarySection({
  children,
  onEdit,
}: {
  children: React.ReactNode;
  onEdit: () => void;
}): React.ReactElement {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
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
