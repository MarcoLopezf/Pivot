import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";

/**
 * API Response Format
 */
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Fetch user's roadmap from API
 * Returns null if roadmap not found (404) - valid state, not an error
 * Throws error for network/server errors
 */
export async function fetchRoadmap(userId: string): Promise<RoadmapDTO | null> {
  const response = await fetch(
    `/api/learning/roadmap?userId=${encodeURIComponent(userId)}`,
  );

  if (response.status === 404) {
    // 404 is a valid state - user hasn't generated a roadmap yet
    return null;
  }

  if (!response.ok) {
    const errorData = (await response.json()) as ApiErrorResponse;
    throw new Error(errorData.error.code);
  }

  const data = (await response.json()) as ApiSuccessResponse<RoadmapDTO>;
  return data.data;
}

/**
 * Update roadmap item status via API
 * Throws error if roadmap/item not found or other server errors
 */
export async function updateItemStatus(
  roadmapId: string,
  itemId: string,
  status: "pending" | "in_progress" | "completed",
): Promise<RoadmapDTO> {
  const response = await fetch(
    `/api/learning/roadmap/items/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roadmapId,
        status,
      }),
    },
  );

  if (!response.ok) {
    const errorData = (await response.json()) as ApiErrorResponse;
    throw new Error(errorData.error.code);
  }

  const data = (await response.json()) as ApiSuccessResponse<RoadmapDTO>;
  return data.data;
}
