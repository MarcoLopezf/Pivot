import { type ReactNode } from "react";

/**
 * OnboardingLayout - Distraction-free layout for onboarding process
 *
 * Provides a full-screen environment for the two-column onboarding wizard.
 * The layout delegates all visual structure to StepContainer.
 *
 * Features:
 * - Full viewport height (minus header)
 * - No padding or constraints (handled by StepContainer)
 * - Uses the global SiteHeader from root layout
 *
 * @layer Interface (Web)
 */

interface OnboardingLayoutProps {
  children: ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return <div className="min-h-[calc(100vh-4rem)]">{children}</div>;
}
