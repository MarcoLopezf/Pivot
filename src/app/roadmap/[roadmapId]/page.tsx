import { notFound } from "next/navigation";
import { RoadmapHeader } from "@interfaces/web/components/roadmap/RoadmapHeader";
import { RoadmapTimelineClient } from "@interfaces/web/components/roadmap/RoadmapTimelineClient";
import {
  getRoadmapByIdAction,
  getQuizStatsForRoadmapAction,
} from "@interfaces/web/actions/learningActions";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";
import type { RoadmapItemType } from "@application/dtos/learning/RoadmapDTO";

interface RoadmapOverviewPageProps {
  params: Promise<{ roadmapId: string }>;
}

const HOURS_ESTIMATE: Record<
  RoadmapItemType,
  Record<DifficultyLevel, number>
> = {
  theory: {
    [DifficultyLevel.Beginner]: 1,
    [DifficultyLevel.Intermediate]: 2,
    [DifficultyLevel.Advanced]: 3,
  },
  project: {
    [DifficultyLevel.Beginner]: 3,
    [DifficultyLevel.Intermediate]: 5,
    [DifficultyLevel.Advanced]: 8,
  },
};

export default async function RoadmapOverviewPage({
  params,
}: RoadmapOverviewPageProps): Promise<React.ReactElement> {
  const { roadmapId } = await params;
  const [result, quizStats] = await Promise.all([
    getRoadmapByIdAction(roadmapId),
    getQuizStatsForRoadmapAction(roadmapId),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const { roadmap, targetRole, currentRole } = result.data;

  const totalItems = roadmap.items.length;
  const completedItems = roadmap.items.filter(
    (item) => item.status === "completed",
  ).length;

  const avgQuizScore = quizStats.success
    ? (quizStats.data?.avgScore ?? null)
    : null;

  const estimatedHoursLeft = roadmap.items
    .filter((item) => item.status !== "completed")
    .reduce((sum, item) => sum + HOURS_ESTIMATE[item.type][item.difficulty], 0);

  const description = `Master the skills required to transition from ${currentRole} to ${targetRole}. Follow this personalized learning path to build your expertise.`;

  const activeItem =
    roadmap.items.find((item) => item.status === "in_progress") ??
    roadmap.items.find((item) => item.status === "pending");
  const currentModule = activeItem
    ? {
        id: activeItem.id,
        title: activeItem.title,
        tags: activeItem.tags,
      }
    : null;

  return (
    <div>
      <RoadmapHeader
        title={roadmap.title}
        description={description}
        progress={roadmap.progress}
        totalItems={totalItems}
        completedItems={completedItems}
        estimatedHoursLeft={estimatedHoursLeft}
        avgQuizScore={avgQuizScore}
        roadmapId={roadmap.id}
        currentModule={currentModule}
      />

      <RoadmapTimelineClient initialRoadmap={roadmap} />
    </div>
  );
}
