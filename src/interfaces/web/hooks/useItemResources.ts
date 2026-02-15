import { useState, useCallback } from "react";
import { LearningResource } from "@domain/learning/repositories/IResourceRepository";

/**
 * API Response Types
 */
interface ApiSuccessResponse {
  success: true;
  data: LearningResource[];
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

/**
 * Return type for the useItemResources hook
 */
export interface UseItemResourcesResult {
  resources: LearningResource[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchResources: () => Promise<void>;
}

/**
 * useItemResources Hook
 *
 * Custom hook for fetching learning resources (videos) for a roadmap item.
 * Uses "Fetch on Demand" strategy to save API quota - does NOT auto-fetch on mount.
 *
 * Usage:
 * ```tsx
 * const { resources, isLoading, error, fetchResources } = useItemResources(itemId, tags, difficulty);
 *
 * <button onClick={fetchResources}>Show Resources</button>
 * ```
 *
 * Features:
 * - Lazy loading (manual trigger)
 * - Prevents duplicate fetches
 * - Error handling
 * - Loading states
 * - Difficulty-based contextualized search
 */
export function useItemResources(
  itemId: string,
  tags: string[],
  difficulty?: string,
): UseItemResourcesResult {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Serialize tags for stable dependency comparison
  const tagsKey = JSON.stringify(tags);

  /**
   * Fetch resources from API
   *
   * Only fetches once per item (prevents duplicate API calls).
   * Prevents race conditions by checking both hasFetched and isLoading.
   * Can be triggered manually by user action.
   */
  const fetchResources = useCallback(async (): Promise<void> => {
    // Guard: Already fetched or currently loading (prevents race conditions)
    if (hasFetched || isLoading) {
      return;
    }

    // Guard: Invalid inputs
    if (!itemId || !tags || tags.length === 0) {
      setError("Invalid item or tags");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query string with tags array and difficulty
      const queryParams = new URLSearchParams();
      tags.forEach((tag) => queryParams.append("tags", tag));

      if (difficulty) {
        queryParams.append("difficulty", difficulty);
      }

      const response = await fetch(
        `/api/learning/roadmap/items/${itemId}/resources?${queryParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error.message);
      }

      setResources(data.data);
      setHasFetched(true);
    } catch (err) {
      console.error("[useItemResources] Error fetching resources:", err);
      setError(err instanceof Error ? err.message : "Failed to load resources");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, tagsKey, difficulty, hasFetched, isLoading]);

  return {
    resources,
    isLoading,
    error,
    hasFetched,
    fetchResources,
  };
}
