import { notFound } from "next/navigation";
import { RoadmapHeader } from "@interfaces/web/components/roadmap/RoadmapHeader";
import { RoadmapTimelineClient } from "@interfaces/web/components/roadmap/RoadmapTimelineClient";
import { getRoadmapByIdAction } from "@interfaces/web/actions/learningActions";

interface RoadmapOverviewPageProps {
  params: Promise<{ roadmapId: string }>;
}

const ESTIMATED_HOURS_PER_MODULE = 2;

export default async function RoadmapOverviewPage({
  params,
}: RoadmapOverviewPageProps): Promise<React.ReactElement> {
  const { roadmapId } = await params;
  const result = await getRoadmapByIdAction(roadmapId);

  if (!result.success || !result.data) {
    notFound();
  }

  const { roadmap, targetRole, currentRole } = result.data;

  const totalItems = roadmap.items.length;
  const completedItems = roadmap.items.filter(
    (item) => item.status === "completed",
  ).length;

  let currentStreak = 0;
  for (const item of roadmap.items) {
    if (item.status === "completed") {
      currentStreak++;
    } else {
      break;
    }
  }

  const totalHours = totalItems * ESTIMATED_HOURS_PER_MODULE;

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
        totalHours={totalHours}
        currentStreak={currentStreak}
        roadmapId={roadmap.id}
        currentModule={currentModule}
      />

      <RoadmapTimelineClient initialRoadmap={roadmap} />
    </div>
  );
}
