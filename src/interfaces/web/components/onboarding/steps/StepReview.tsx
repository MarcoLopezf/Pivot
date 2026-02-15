"use client";

import { useState } from "react";
import { StepContainer } from "../StepContainer";
import { useOnboardingStore } from "@interfaces/web/stores/useOnboardingStore";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  Briefcase,
  Target,
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

  // Validate and prepare all fields with type guards (no "as" casts)
  const nameValue = typeof data.name === "string" ? data.name : undefined;
  const regionValue = typeof data.region === "string" ? data.region : undefined;
  const targetRoleValue =
    typeof data.targetRole === "string" ? data.targetRole : undefined;
  const currentRoleValue =
    typeof data.currentRole === "string" ? data.currentRole : undefined;
  const resumeFileNameValue =
    typeof data.resumeFileName === "string" ? data.resumeFileName : undefined;

  const experienceLabel = formatExperience(data.yearsExperience);

  // Compute experience display value
  const experienceValue = currentRoleValue
    ? `${currentRoleValue}${experienceLabel ? ` (${experienceLabel})` : ""}`
    : experienceLabel || undefined;

  // Compute resume preview
  const resumePreview =
    data.resumeText && typeof data.resumeText === "string"
      ? data.resumeText.length > 200
        ? `${data.resumeText.slice(0, 200)}...`
        : data.resumeText
      : undefined;

  return (
    <StepContainer
      currentStep={6}
      totalSteps={7}
      title="Ready to launch your career?"
      description="Review your details to ensure the AI builds the perfect path for you."
      quote="Success is where preparation and opportunity meet."
      quoteAuthor="Bobby Unser"
      onNext={handleGenerate}
      onBack={previousStep}
      isLoading={isLoading}
      nextLabel="Generate Roadmap"
    >
      <div className="space-y-4">
        {/* Name */}
        <ReviewItem
          icon={<User className="h-5 w-5 text-slate-600" />}
          iconBg="bg-slate-100"
          label="Name"
          value={nameValue}
          onEdit={() => goToStep(1)}
        />

        {/* Region */}
        <ReviewItem
          icon={<MapPin className="h-5 w-5 text-slate-600" />}
          iconBg="bg-slate-100"
          label="Region"
          value={regionValue}
          onEdit={() => goToStep(1)}
        />

        {/* Role (Target Role) */}
        <ReviewItem
          icon={<Target className="h-5 w-5 text-slate-600" />}
          iconBg="bg-slate-100"
          label="Role"
          value={targetRoleValue}
          onEdit={() => goToStep(4)}
        />

        {/* Experience (Current Role + Years) */}
        <ReviewItem
          icon={<Briefcase className="h-5 w-5 text-slate-600" />}
          iconBg="bg-slate-100"
          label="Experience"
          value={experienceValue}
          onEdit={() => goToStep(2)}
        />

        {/* Resume / Manual Experience */}
        {(resumeFileNameValue || resumePreview) && (
          <ReviewItem
            icon={<FileText className="h-5 w-5 text-slate-600" />}
            iconBg="bg-slate-100"
            label={resumeFileNameValue ? "Resume" : "Experience"}
            value={resumeFileNameValue ?? "Manual entry"}
            extraInfo={resumePreview}
            onEdit={() => goToStep(5)}
          />
        )}

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
 * ReviewItem - Individual review card for each onboarding data point
 */
function ReviewItem({
  icon,
  iconBg,
  label,
  value,
  extraInfo,
  onEdit,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: string;
  extraInfo?: string;
  onEdit: () => void;
}): React.ReactElement {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        {/* Icon + Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon Circle */}
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}
          >
            {icon}
          </div>

          {/* Label + Value */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-sm font-semibold text-slate-900 break-words">
              {value || "Not provided"}
            </p>
            {extraInfo && (
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {extraInfo}
              </p>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 flex-shrink-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          aria-label={`Edit ${label}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
