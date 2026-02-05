"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@interfaces/web/components/dashboard/DashboardHeader";
import { ProgressOverview } from "@interfaces/web/components/dashboard/ProgressOverview";
import { NextMissionCard } from "@interfaces/web/components/dashboard/NextMissionCard";
import { DashboardDTO } from "@application/dtos/dashboard/DashboardDTO";
import { getDashboardAction } from "@interfaces/web/actions/dashboardActions";

/**
 * Dashboard Page
 *
 * Main dashboard view that aggregates User, CareerGoal, and Roadmap data.
 * Displays:
 * - Personalized greeting with career goal
 * - Learning progress overview
 * - Next task/mission card
 *
 * Protected by middleware - user authentication verified before access.
 */
export default function DashboardPage(): React.ReactElement {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        // Call Server Action directly (user authenticated via Supabase)
        const result = await getDashboardAction();

        if (result.success && result.data) {
          setDashboardData(result.data);
        } else {
          throw new Error(result.error || "Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []); // No dependencies - middleware ensures auth

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.refresh()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state - User has no career goal
  if (!dashboardData?.careerGoal) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome to PIVOT AI, {dashboardData?.userName || "there"}!
            </CardTitle>
            <CardDescription>
              Get started by setting your career goal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To begin your personalized learning journey, you need to set a
              career goal. This will help us create a customized roadmap
              tailored to your aspirations.
            </p>
            <Link href="/onboarding/goals">
              <Button size="lg">Set Your Career Goal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="container mx-auto p-8 space-y-6">
      <DashboardHeader
        userName={dashboardData.userName}
        careerGoal={dashboardData.careerGoal}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ProgressOverview
          progress={dashboardData.progress}
          totalTasks={dashboardData.totalTasks}
          completedTasks={dashboardData.completedTasks}
        />
        <NextMissionCard nextTask={dashboardData.nextTask} />
      </div>

      {dashboardData.totalTasks === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">
              Generate Your Learning Roadmap
            </CardTitle>
            <CardDescription className="text-blue-700">
              You have set your career goal, but your roadmap has not been
              generated yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 mb-4">
              Click below to generate a personalized learning roadmap based on
              your career goal: <strong>{dashboardData.careerGoal}</strong>
            </p>
            <Link href="/onboarding/goals">
              <Button>Generate Roadmap</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
