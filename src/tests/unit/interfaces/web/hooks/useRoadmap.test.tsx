import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRoadmap } from "@interfaces/web/hooks/useRoadmap";
import * as roadmapApi from "@interfaces/web/api/roadmapApi";

vi.mock("@interfaces/web/api/roadmapApi");

describe("useRoadmap Hook", () => {
  const mockRoadmapData = {
    id: "roadmap-001",
    goalId: "goal-001",
    title: "Test Roadmap",
    progress: 0,
    items: [
      {
        id: "item-001",
        title: "Item 1",
        description: "desc",
        order: 1,
        status: "pending" as const,
      },
      {
        id: "item-002",
        title: "Item 2",
        description: "desc",
        order: 2,
        status: "pending" as const,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    vi.mocked(roadmapApi.fetchRoadmap).mockImplementation(
      () => new Promise(() => {}),
    );

    const { result } = renderHook(() => useRoadmap("user-001"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.roadmap).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should fetch roadmap on mount", async () => {
    vi.mocked(roadmapApi.fetchRoadmap).mockResolvedValue(mockRoadmapData);

    const { result } = renderHook(() => useRoadmap("user-001"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.roadmap).toEqual(mockRoadmapData);
    expect(result.current.error).toBeNull();
    expect(roadmapApi.fetchRoadmap).toHaveBeenCalledWith("user-001");
  });

  it("should handle 404 response (no roadmap) as valid state", async () => {
    vi.mocked(roadmapApi.fetchRoadmap).mockRejectedValue(
      new Error("ROADMAP_NOT_FOUND"),
    );

    const { result } = renderHook(() => useRoadmap("user-001"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.roadmap).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should handle network errors", async () => {
    vi.mocked(roadmapApi.fetchRoadmap).mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useRoadmap("user-001"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.roadmap).toBeNull();
    expect(result.current.error).not.toBeNull();
  });

  it("should perform optimistic update on toggleItemStatus", async () => {
    vi.mocked(roadmapApi.fetchRoadmap).mockResolvedValue(mockRoadmapData);
    vi.mocked(roadmapApi.updateItemStatus).mockResolvedValue({
      ...mockRoadmapData,
      items: [
        { ...mockRoadmapData.items[0], status: "in_progress" as const },
        mockRoadmapData.items[1],
      ],
      progress: 0,
    });

    const { result } = renderHook(() => useRoadmap("user-001"));

    await waitFor(() => {
      expect(result.current.roadmap).not.toBeNull();
    });

    const initialRoadmap = result.current.roadmap!;
    expect(initialRoadmap.items[0].status).toBe("pending");

    // Perform optimistic update
    await result.current.toggleItemStatus("item-001", "in_progress");

    // Check optimistic update happened (with waitFor due to React state timing)
    await waitFor(() => {
      expect(result.current.roadmap!.items[0].status).toBe("in_progress");
    });

    // Wait for server response
    await waitFor(() => {
      expect(roadmapApi.updateItemStatus).toHaveBeenCalled();
    });
  });

  it("should revert optimistic update on error", async () => {
    vi.mocked(roadmapApi.fetchRoadmap).mockResolvedValue(mockRoadmapData);
    vi.mocked(roadmapApi.updateItemStatus).mockRejectedValue(
      new Error("Server error"),
    );

    const { result } = renderHook(() => useRoadmap("user-001"));

    await waitFor(() => {
      expect(result.current.roadmap).not.toBeNull();
    });

    const initialRoadmap = result.current.roadmap!;
    expect(initialRoadmap.items[0].status).toBe("pending");

    // Attempt to update (will fail)
    await result.current.toggleItemStatus("item-001", "in_progress");

    // Wait a bit to ensure state is reverted
    await waitFor(() => {
      // Should revert to original state
      expect(result.current.roadmap!.items[0].status).toBe("pending");
    });
  });

  it("should refetch roadmap", async () => {
    const updatedRoadmap = {
      ...mockRoadmapData,
      title: "Updated Roadmap",
    };

    vi.mocked(roadmapApi.fetchRoadmap)
      .mockResolvedValueOnce(mockRoadmapData)
      .mockResolvedValueOnce(updatedRoadmap);

    const { result } = renderHook(() => useRoadmap("user-001"));

    await waitFor(() => {
      expect(result.current.roadmap).not.toBeNull();
    });

    expect(result.current.roadmap!.title).toBe("Test Roadmap");

    // Trigger refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.roadmap!.title).toBe("Updated Roadmap");
    });
  });
});
