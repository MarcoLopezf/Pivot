"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/**
 * StepContainer - Reusable wrapper for onboarding wizard steps
 *
 * Provides consistent structure across all onboarding steps with:
 * - Title and optional description
 * - Content area for step-specific forms
 * - Navigation buttons (Back/Next) with loading states
 *
 * Implements DRY principle for wizard step UI.
 *
 * @layer Interface (Web)
 */

interface StepContainerProps {
  /** Step title displayed at the top */
  title: string;

  /** Optional description/subtitle for the step */
  description?: string;

  /** Step content (forms, inputs, etc.) */
  children: ReactNode;

  /** Handler for "Next" button click */
  onNext: () => void;

  /** Optional handler for "Back" button click. If undefined, button is hidden */
  onBack?: () => void;

  /** Disables the "Next" button (e.g., for validation) */
  isNextDisabled?: boolean;

  /** Shows loading spinner in "Next" button */
  isLoading?: boolean;

  /** Custom label for "Next" button */
  nextLabel?: string;

  /** Custom label for "Back" button */
  backLabel?: string;
}

export function StepContainer({
  title,
  description,
  children,
  onNext,
  onBack,
  isNextDisabled = false,
  isLoading = false,
  nextLabel = "Continue",
  backLabel = "Back",
}: StepContainerProps) {
  return (
    <Card className="shadow-lg">
      {/* Header */}
      <CardHeader className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-base text-muted-foreground">{description}</p>
        )}
      </CardHeader>

      {/* Body - Step Content */}
      <CardContent className="py-6">{children}</CardContent>

      {/* Footer - Navigation Buttons */}
      <CardFooter className="flex justify-between gap-4">
        {/* Back Button - Only show if onBack is provided */}
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="gap-2"
          >
            {backLabel}
          </Button>
        ) : (
          // Spacer to keep Next button aligned to the right when no Back button
          <div />
        )}

        {/* Next Button */}
        <Button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isLoading}
          className="gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {nextLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
