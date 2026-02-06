"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { RoadmapTimeline } from "@interfaces/web/components/roadmap/RoadmapTimeline";
import * as roadmapApi from "@interfaces/web/api/roadmapApi";
import { toast } from "sonner";

interface RoadmapTimelineClientProps {
  initialRoadmap: RoadmapDTO;
}

/**
 * RoadmapTimelineClient
 *
 * Client wrapper around RoadmapTimeline that manages interactive state:
 * optimistic status updates, quiz navigation, and project submission refetch.
 */
export function RoadmapTimelineClient({
  initialRoadmap,
}: RoadmapTimelineClientProps): React.ReactElement {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<RoadmapDTO>(initialRoadmap);

  const toggleItemStatus = useCallback(
    async (
      itemId: string,
      newStatus: "pending" | "in_progress" | "completed",
    ): Promise<void> => {
      const previousRoadmap = roadmap;

      // Optimistic update
      const updatedItems = roadmap.items.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item,
      );
      const completedCount = updatedItems.filter(
        (item) => item.status === "completed",
      ).length;
      const updatedRoadmap: RoadmapDTO = {
        ...roadmap,
        items: updatedItems,
        progress:
          updatedItems.length > 0
            ? Math.round((completedCount / updatedItems.length) * 100)
            : 0,
      };

      setRoadmap(updatedRoadmap);

      try {
        const result = await roadmapApi.updateItemStatus(
          roadmap.id,
          itemId,
          newStatus,
        );
        setRoadmap(result);
        toast.success("Item status updated");
      } catch (err) {
        setRoadmap(previousRoadmap);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update item";
        toast.error(`Failed to update item: ${errorMessage}`);
      }
    },
    [roadmap],
  );

  const handleTakeQuiz = (itemId: string): void => {
    router.push(`/quiz/${roadmap.id}/${itemId}`);
  };

  return (
    <RoadmapTimeline
      roadmap={roadmap}
      onItemStatusChange={toggleItemStatus}
      onTakeQuiz={handleTakeQuiz}
      onProjectSubmitted={() => router.refresh()}
    />
  );
}
