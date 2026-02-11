import type { ReactNode } from "react";

/**
 * Onboarding Layout - Full-screen layout without header/footer
 *
 * Overrides the root layout to provide a distraction-free,
 * full-screen experience for the onboarding flow.
 *
 * The two-column design is handled by StepContainer components.
 */
export default function OnboardingRootLayout({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
