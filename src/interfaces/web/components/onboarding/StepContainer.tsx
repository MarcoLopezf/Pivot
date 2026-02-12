"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

/**
 * StepContainer - Reusable wrapper for onboarding wizard steps
 *
 * Two-column layout with:
 * - Left panel: Motivational quote, logo, decorations (dark blue gradient)
 * - Right panel: Step content with progress, title, form, and navigation
 *
 * Implements DRY principle for wizard step UI with new design system.
 *
 * @layer Interface (Web)
 */

interface StepContainerProps {
  /** Current step number (1-7) */
  currentStep: number;

  /** Total number of steps (default 7) */
  totalSteps?: number;

  /** Step title displayed at the top */
  title: string;

  /** Optional description/subtitle for the step */
  description?: string;

  /** Motivational quote for left panel */
  quote: string;

  /** Author of the quote */
  quoteAuthor: string;

  /** Optional footer text for left panel (e.g., "YOUR JOURNEY BEGINS") */
  leftPanelFooter?: string;

  /** Optional decoration element for left panel (e.g., illustrations, graphics) */
  decorationElement?: ReactNode;

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
  currentStep,
  totalSteps = 7,
  title,
  description,
  quote,
  quoteAuthor,
  leftPanelFooter,
  decorationElement,
  children,
  onNext,
  onBack,
  isNextDisabled = false,
  isLoading = false,
  nextLabel = "Continue",
  backLabel = "Back",
}: StepContainerProps) {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full">
      {/* Left Panel - Motivational */}
      <div className="hidden md:flex md:w-2/5 xl:w-5/12 bg-gradient-to-br from-[#1D2D50] via-[#1D2D50] to-[#133B5C] flex-col justify-between p-10 xl:p-12 text-white">
        {/* Logo */}
        {/* Borrar o decidir antes de hacer un commit  */}
        {/* <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase tracking-wider text-xs font-medium">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="font-semibold text-slate-300 text-sm">
                {progressPercentage}%
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-1.5 bg-white/15 [&>div]:bg-[#4DC9F6]"
            />
          </div> */}
        <div className="flex-shrink-0">
          <h2 className="text-xl font-bold tracking-tight">
            <span className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M3 3l18 18M3 21L21 3" />
              </svg>
              PIVOT
            </span>
          </h2>
        </div>

        {/* Quote Section */}
        <div className="flex-1 flex items-center">
          <div className="space-y-6">
            {/* Quote marks */}
            <div className="text-5xl text-slate-400 leading-none">&ldquo;</div>

            {/* Quote text */}
            <blockquote className="text-xl xl:text-2xl font-light italic leading-relaxed text-white">
              {quote}
            </blockquote>

            {/* Author */}
            <p className="text-xs text-slate-300 uppercase tracking-widest font-normal">
              &mdash; {quoteAuthor}
            </p>
          </div>
        </div>

        {/* Footer / Decoration */}
        <div className="flex-shrink-0">
          {decorationElement && <div className="mb-4">{decorationElement}</div>}
          {leftPanelFooter && (
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              {leftPanelFooter}
            </p>
          )}
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        <div className="flex flex-col h-full max-w-2xl w-full mx-auto px-6 md:px-8 xl:px-12">
          {/* Progress Indicator - Always visible top */}
          <div className="pt-8 xl:pt-12 pb-4 space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 uppercase tracking-wider text-xs font-medium">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="font-semibold text-slate-700 text-sm">
                {progressPercentage}%
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-1.5 bg-slate-200 [&>div]:bg-[#1E5F74]"
            />
          </div>

          {/* Step Header - Always visible top */}
          <div className="pb-6 space-y-3 flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1D2D50] leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Step Content - Only this area scrolls if needed */}
          <div className="flex-1 overflow-y-auto min-h-0">{children}</div>

          {/* Navigation Buttons - Always visible bottom */}
          <div className="flex items-center justify-between gap-4 py-6 border-t border-slate-200 flex-shrink-0">
            {/* Back Button */}
            {onBack ? (
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isLoading}
                className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            ) : (
              <div />
            )}

            {/* Next Button */}
            <Button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              className="gap-2 bg-[#1D2D50] hover:bg-[#152340] text-white transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {nextLabel}
                </>
              ) : (
                <>
                  {nextLabel}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
