import { type ReactNode } from "react";

/**
 * OnboardingLayout - Distraction-free layout for onboarding process
 *
 * Provides a clean, focused environment for users to complete
 * the onboarding wizard without navigation or other distractions.
 *
 * Features:
 * - Centered content with max-width constraint
 * - Subtle background for visual comfort
 * - Uses the global SiteHeader from root layout
 *
 * @layer Interface (Web)
 */

interface OnboardingLayoutProps {
  children: ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-muted/30 py-8">
      <div className="w-full max-w-3xl px-4">{children}</div>
    </div>
  );
}
