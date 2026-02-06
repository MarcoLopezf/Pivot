import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoadmapHeader } from "@interfaces/web/components/roadmap/RoadmapHeader";
import { RoadmapStats } from "@interfaces/web/components/roadmap/RoadmapStats";
import { RoadmapTimelineClient } from "@interfaces/web/components/roadmap/RoadmapTimelineClient";
import { getRoadmapByIdAction } from "@interfaces/web/actions/learningActions";
import { ArrowRight } from "lucide-react";

interface RoadmapOverviewPageProps {
  params: Promise<{ roadmapId: string }>;
}

const ESTIMATED_HOURS_PER_MODULE = 2;

/**
 * Roadmap Overview Page (Server Component)
 *
 * Main navigation hub for a specific learning path.
 * Fetches data server-side and renders:
 * - Header: hero section with title, role badge, and progress bar
 * - Stats: 4-card grid of metrics
 * - Timeline: interactive roadmap items (client component)
 */
export default async function RoadmapOverviewPage({
  params,
}: RoadmapOverviewPageProps): Promise<React.ReactElement> {
  const { roadmapId } = await params;
  const result = await getRoadmapByIdAction(roadmapId);

  if (!result.success || !result.data) {
    notFound();
  }

  const { roadmap, targetRole } = result.data;

  const totalItems = roadmap.items.length;
  const completedItems = roadmap.items.filter(
    (item) => item.status === "completed",
  ).length;

  // Calculate streak: consecutive completed items from the start
  let currentStreak = 0;
  for (const item of roadmap.items) {
    if (item.status === "completed") {
      currentStreak++;
    } else {
      break;
    }
  }

  const totalHours = totalItems * ESTIMATED_HOURS_PER_MODULE;

  // Find first incomplete item for "Continue Learning" CTA
  const firstIncompleteItem = roadmap.items.find(
    (item) => item.status !== "completed",
  );

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-6xl space-y-6">
      {/* Hero Header */}
      <RoadmapHeader
        title={roadmap.title}
        role={targetRole}
        progress={roadmap.progress}
        totalItems={totalItems}
        completedItems={completedItems}
      />

      {/* Stats Grid */}
      <RoadmapStats
        totalItems={totalItems}
        completedItems={completedItems}
        totalHours={totalHours}
        currentStreak={currentStreak}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2">
          <RoadmapTimelineClient initialRoadmap={roadmap} />
        </div>

        {/* Right Column - Sidebar (Desktop) */}
        <div className="space-y-6">
          {/* Continue Learning CTA */}
          {firstIncompleteItem && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Ready to continue?
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Pick up where you left off with your next module.
                </p>
                <Button className="w-full gap-2" asChild>
                  <Link
                    href={`/roadmap/${roadmap.id}/item/${firstIncompleteItem.id}`}
                  >
                    Continue Learning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* All Complete State */}
          {!firstIncompleteItem && totalItems > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <p className="font-semibold text-green-900">
                  All modules completed!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Congratulations on finishing your learning path.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
