import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoadmapItemDTO } from "@application/dtos/learning/RoadmapDTO";

interface NextMissionCardProps {
  nextTask: RoadmapItemDTO | null;
}

/**
 * NextMissionCard Component
 *
 * Displays the next task in the user's learning roadmap as a call-to-action card.
 * Links to the full roadmap page where users can view all tasks.
 */
export function NextMissionCard({
  nextTask,
}: NextMissionCardProps): React.ReactElement {
  if (!nextTask) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Next Mission</CardTitle>
          <CardDescription>What you should focus on next</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No active tasks at the moment. Great job!
          </p>
          <Link href="/onboarding/roadmap">
            <Button variant="outline" className="w-full">
              View Full Roadmap
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Next Mission</CardTitle>
          <Badge
            variant={
              nextTask.status === "in_progress" ? "default" : "secondary"
            }
          >
            {nextTask.status === "in_progress" ? "In Progress" : "Pending"}
          </Badge>
        </div>
        <CardDescription>What you should focus on next</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{nextTask.title}</h3>
          <p className="text-sm text-muted-foreground">
            {nextTask.description}
          </p>
        </div>
        <Link href="/onboarding/roadmap">
          <Button className="w-full">
            {nextTask.status === "in_progress"
              ? "Continue Learning"
              : "Start Learning"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
