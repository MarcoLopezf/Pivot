"use client";

import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { RoadmapTimeline } from "@interfaces/web/components/roadmap/RoadmapTimeline";

interface RoadmapTimelineClientProps {
  initialRoadmap: RoadmapDTO;
}

export function RoadmapTimelineClient({
  initialRoadmap,
}: RoadmapTimelineClientProps): React.ReactElement {
  return <RoadmapTimeline roadmap={initialRoadmap} />;
}
