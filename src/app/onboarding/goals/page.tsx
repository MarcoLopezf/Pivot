import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CareerGoalForm } from "@interfaces/web/components/learning/CareerGoalForm";

export const metadata: Metadata = {
  title: "Set Your Career Goal | PIVOT AI",
  description: "Define your career transition goal with AI-powered suggestions",
};

/**
 * Onboarding Career Goals Page
 *
 * Server component that renders the career goal selection form.
 * Features AI-powered role suggestions powered by Gemini 2.0 Flash.
 *
 * TODO: Replace hardcoded userId with actual session user when auth is implemented
 */
export default function OnboardingGoalsPage(): React.ReactElement {
  // TODO: Get userId from session/auth
  // For now, using a placeholder. In production, this would come from NextAuth session
  const userId = "temp-user-id";

  // TODO: Get user's actual skills from their profile
  // For now, using placeholder skills
  const userSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Define Your Career Goal
          </CardTitle>
          <CardDescription>
            Tell us where you are and where you want to go. Our AI will help you
            discover the perfect career path.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CareerGoalForm userId={userId} defaultSkills={userSkills} />
        </CardContent>
      </Card>
    </div>
  );
}
