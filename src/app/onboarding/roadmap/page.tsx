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
import { Skeleton } from "@/components/ui/skeleton";
import { useRoadmap } from "@interfaces/web/hooks/useRoadmap";
import { RoadmapTimeline } from "@interfaces/web/components/roadmap/RoadmapTimeline";
import { AlertCircle, ArrowRight } from "lucide-react";
import { getOnboardingUserId } from "@interfaces/web/utils/onboardingStorage";

/**
 * Onboarding Roadmap Page
 *
 * Displays user's generated learning roadmap with interactive status tracking.
 * - Loads roadmap for the current user (from sessionStorage)
 * - Shows loading skeleton while fetching
 * - Displays empty state if roadmap not generated yet
 * - Shows error state if fetch fails or userId not found
 * - Allows toggling item status with optimistic updates
 * - Navigate to dashboard when ready
 *
 * TODO: Replace sessionStorage with NextAuth session when auth is implemented
 */
export default function OnboardingRoadmapPage(): React.ReactElement {
  const router = useRouter();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Get userId from sessionStorage on mount
  React.useEffect(() => {
    const storedUserId = getOnboardingUserId();
    setUserId(storedUserId);
    setIsCheckingAuth(false);
  }, []);

  // Only call useRoadmap when we have a userId (skip if null)
  // Using a dummy empty string during check, but showing loading state prevents fetch
  const { roadmap, isLoading, error, toggleItemStatus } = useRoadmap(
    userId || "",
  );

  // Handle quiz navigation
  const handleTakeQuiz = (itemId: string) => {
    if (!roadmap) return;
    router.push(`/quiz/${roadmap.id}/${itemId}`);
  };

  // Checking auth state
  if (isCheckingAuth) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Loading...</CardTitle>
            <CardDescription>Checking your session</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // No userId found - redirect to profile
  if (!userId) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Profile Not Found</CardTitle>
            </div>
            <CardDescription className="text-red-800">
              Please complete your profile first before viewing your roadmap.
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

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Your Learning Roadmap
            </CardTitle>
            <CardDescription>Loading your roadmap...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skeleton loader - 4 placeholder items */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">
                Error Loading Roadmap
              </CardTitle>
            </div>
            <CardDescription className="text-red-800">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-900 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state - no roadmap generated yet
  if (!roadmap) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Your Learning Roadmap
            </CardTitle>
            <CardDescription>No roadmap generated yet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You haven&apos;t generated a learning roadmap yet. Create a career
              goal first to generate your personalized roadmap.
            </p>
            <Button onClick={() => router.push("/onboarding/goals")}>
              Set Your Career Goal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - display roadmap
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Your Learning Roadmap
          </CardTitle>
          <CardDescription>
            {roadmap.title} • {roadmap.items.length} steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Roadmap Timeline */}
          <RoadmapTimeline
            roadmap={roadmap}
            onItemStatusChange={toggleItemStatus}
            onTakeQuiz={handleTakeQuiz}
          />

          {/* Continue Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => router.push("/dashboard")} className="gap-2">
              {roadmap.progress > 0
                ? "Continue to Dashboard"
                : "Explore Dashboard"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
