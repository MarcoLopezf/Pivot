import { useState, useEffect, useCallback } from "react";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import * as roadmapApi from "@interfaces/web/api/roadmapApi";
import { toast } from "sonner";

export interface UseRoadmapResult {
  roadmap: RoadmapDTO | null;
  isLoading: boolean;
  error: string | null;
  toggleItemStatus: (
    itemId: string,
    newStatus: "pending" | "in_progress" | "completed",
  ) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useRoadmap Hook
 *
 * Manages roadmap state with fetch + optimistic updates.
 * - Auto-fetches on mount
 * - Optimistic UI updates (immediate feedback)
 * - Reverts to previous state on server error
 * - Toast notifications for success/error
 */
export function useRoadmap(userId: string): UseRoadmapResult {
  const [roadmap, setRoadmap] = useState<RoadmapDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch roadmap on mount
  useEffect(() => {
    // Skip fetch if userId is empty (initial state)
    if (!userId || userId.trim() === "") {
      setIsLoading(false);
      setRoadmap(null);
      setError(null);
      return;
    }

    const fetchInitialRoadmap = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await roadmapApi.fetchRoadmap(userId);
        setRoadmap(data);
      } catch (err) {
        // 404 is not an error - user hasn't generated a roadmap yet
        if (err instanceof Error && err.message === "ROADMAP_NOT_FOUND") {
          setRoadmap(null);
          setError(null);
        } else {
          // Network or server error
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch roadmap";
          setError(errorMessage);
          setRoadmap(null);
          toast.error(`Failed to load roadmap: ${errorMessage}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialRoadmap();
  }, [userId]);

  // Toggle item status with optimistic update
  const toggleItemStatus = useCallback(
    async (
      itemId: string,
      newStatus: "pending" | "in_progress" | "completed",
    ) => {
      if (!roadmap) {
        toast.error("No roadmap loaded");
        return;
      }

      // Save previous state for rollback
      const previousRoadmap = roadmap;

      // Optimistic update
      const updatedRoadmap: RoadmapDTO = {
        ...previousRoadmap,
        items: previousRoadmap.items.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item,
        ),
      };

      // Recalculate progress
      const completedCount = updatedRoadmap.items.filter(
        (item) => item.status === "completed",
      ).length;
      updatedRoadmap.progress =
        updatedRoadmap.items.length > 0
          ? Math.round((completedCount / updatedRoadmap.items.length) * 100)
          : 0;

      setRoadmap(updatedRoadmap);

      // Send to server
      try {
        const result = await roadmapApi.updateItemStatus(
          roadmap.id,
          itemId,
          newStatus,
        );
        setRoadmap(result);
        toast.success("Item status updated");
      } catch (err) {
        // Revert optimistic update
        setRoadmap(previousRoadmap);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update item";
        toast.error(`Failed to update item: ${errorMessage}`);
      }
    },
    [roadmap],
  );

  // Refetch roadmap
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await roadmapApi.fetchRoadmap(userId);
      setRoadmap(data);
    } catch (err) {
      if (err instanceof Error && err.message === "ROADMAP_NOT_FOUND") {
        setRoadmap(null);
        setError(null);
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch roadmap";
        setError(errorMessage);
        setRoadmap(null);
        toast.error(`Failed to refetch roadmap: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    roadmap,
    isLoading,
    error,
    toggleItemStatus,
    refetch,
  };
}
