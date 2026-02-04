import { type ReactNode } from "react";

/**
 * OnboardingLayout - Distraction-free layout for onboarding process
 *
 * Provides a clean, focused environment for users to complete
 * the onboarding wizard without navigation or other distractions.
 *
 * Features:
 * - Minimal header with logo
 * - Centered content with max-width constraint
 * - Subtle background for visual comfort
 *
 * @layer Interface (Web)
 */

interface OnboardingLayoutProps {
  children: ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            {/* Logo - You can replace with actual logo component */}
            <span className="text-2xl font-bold tracking-tight text-primary">
              Pivot
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <div className="w-full max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
