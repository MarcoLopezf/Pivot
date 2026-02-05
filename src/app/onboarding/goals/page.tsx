"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CareerGoalForm } from "@interfaces/web/components/learning/CareerGoalForm";

/**
 * Onboarding Career Goals Page
 *
 * Client component that renders the career goal selection form.
 * Features AI-powered role suggestions powered by Gemini 2.0 Flash.
 *
 * Protected by middleware - user authentication verified before access.
 */
export default function OnboardingGoalsPage(): React.ReactElement {
  // TODO: Get user's actual skills from their profile when profile system is implemented
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
          {/* CareerGoalForm no longer needs userId prop */}
          <CareerGoalForm defaultSkills={userSkills} />
        </CardContent>
      </Card>
    </div>
  );
}
