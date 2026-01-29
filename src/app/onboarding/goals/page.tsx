"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CareerGoalForm } from "@interfaces/web/components/learning/CareerGoalForm";
import { getOnboardingUserId } from "@interfaces/web/utils/onboardingStorage";
import { AlertCircle } from "lucide-react";

/**
 * Onboarding Career Goals Page
 *
 * Client component that renders the career goal selection form.
 * Features AI-powered role suggestions powered by Gemini 2.0 Flash.
 *
 * Reads userId from sessionStorage (saved during profile creation step).
 * If userId not found, redirects user back to profile page.
 *
 * TODO: Replace sessionStorage with NextAuth session when auth is implemented
 */
export default function OnboardingGoalsPage(): React.ReactElement {
  const router = useRouter();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isChecking, setIsChecking] = React.useState(true);

  // Get userId from sessionStorage on mount
  React.useEffect(() => {
    const storedUserId = getOnboardingUserId();
    setUserId(storedUserId);
    setIsChecking(false);
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Loading...
            </CardTitle>
            <CardDescription>Checking your session</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show error state if userId not found (user skipped profile step)
  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-3xl border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Profile Not Found</CardTitle>
            </div>
            <CardDescription className="text-red-800">
              Please complete your profile first before setting career goals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/profile")}
              className="border-red-300 text-red-900 hover:bg-red-100"
            >
              Go to Profile Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - render the form
  const userId_final = userId;

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
          <CareerGoalForm userId={userId_final} defaultSkills={userSkills} />
        </CardContent>
      </Card>
    </div>
  );
}
