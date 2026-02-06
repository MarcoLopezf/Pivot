import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { YouTubeService } from "@infrastructure/services/YouTubeService";

/**
 * Unit tests for YouTubeService
 *
 * Tests YouTube API integration with mocked axios to protect API quota.
 * Ensures proper error handling and data mapping.
 */

// Mock axios module
vi.mock("axios");

// YouTube API response type (simplified)
// Note: search.list only returns 'id' and 'snippet' parts
interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
    };
  }>;
}

// Axios error type
interface AxiosError extends Error {
  response?: {
    status: number;
    data?: unknown;
  };
}

describe("YouTubeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchVideos", () => {
    it("should return mapped LearningResource objects on success", async () => {
      const mockResponse: YouTubeSearchResponse = {
        items: [
          {
            id: { videoId: "video123" },
            snippet: {
              title: "Learn React Hooks - Complete Tutorial",
              channelTitle: "Fireship",
              thumbnails: {
                high: {
                  url: "https://i.ytimg.com/vi/video123/maxresdefault.jpg",
                },
              },
            },
          },
          {
            id: { videoId: "video456" },
            snippet: {
              title: "TypeScript Advanced Patterns",
              channelTitle: "Net Ninja",
              thumbnails: {
                high: {
                  url: "https://i.ytimg.com/vi/video456/maxresdefault.jpg",
                },
              },
            },
          },
        ],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const service = new YouTubeService();
      const results = await service.searchVideos(["react", "hooks"]);

      expect(results).toHaveLength(2);

      // First video
      expect(results[0].title).toBe("Learn React Hooks - Complete Tutorial");
      expect(results[0].channelName).toBe("Fireship");
      expect(results[0].url).toBe("https://www.youtube.com/watch?v=video123");
      expect(results[0].thumbnailUrl).toBe(
        "https://i.ytimg.com/vi/video123/maxresdefault.jpg",
      );
      expect(results[0].tags).toEqual(["react", "hooks"]);
      expect(results[0].type).toBe("video");

      // Second video
      expect(results[1].title).toBe("TypeScript Advanced Patterns");
      expect(results[1].channelName).toBe("Net Ninja");
      expect(results[1].url).toBe("https://www.youtube.com/watch?v=video456");
    });

    it("should return empty array on API error (403 Quota Exceeded)", async () => {
      const error: AxiosError = new Error(
        "Request failed with status code 403",
      ) as AxiosError;
      error.response = { status: 403, data: { error: "quotaExceeded" } };

      vi.mocked(axios.get).mockRejectedValue(error);

      const service = new YouTubeService();
      const results = await service.searchVideos(["react"]);

      expect(results).toEqual([]);
      expect(axios.get).toHaveBeenCalledOnce();
    });

    it("should return empty array on network error", async () => {
      const error = new Error("Network Error");
      vi.mocked(axios.get).mockRejectedValue(error);

      const service = new YouTubeService();
      const results = await service.searchVideos(["typescript"]);

      expect(results).toEqual([]);
    });

    it("should return empty array when API returns no items", async () => {
      const mockResponse: YouTubeSearchResponse = {
        items: [],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const service = new YouTubeService();
      const results = await service.searchVideos(["nonexistenttag123"]);

      expect(results).toEqual([]);
    });

    it("should return empty array when tags array is empty", async () => {
      const service = new YouTubeService();
      const results = await service.searchVideos([]);

      expect(results).toEqual([]);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("should build correct search query from tags without difficulty", async () => {
      const mockResponse: YouTubeSearchResponse = { items: [] };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const service = new YouTubeService();
      await service.searchVideos(["react", "hooks"]);

      expect(axios.get).toHaveBeenCalledWith(
        "https://www.googleapis.com/youtube/v3/search",
        expect.objectContaining({
          params: expect.objectContaining({
            q: "react hooks tutorial guide -shorts -song -music",
            part: "snippet",
            type: "video",
            maxResults: 4,
            videoDefinition: "any",
            safeSearch: "strict",
            order: "rating",
          }),
          timeout: 10000,
        }),
      );
    });

    it("should build beginner-contextualized query with medium duration", async () => {
      const mockResponse: YouTubeSearchResponse = { items: [] };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const service = new YouTubeService();
      await service.searchVideos(["variables"], "beginner");

      expect(axios.get).toHaveBeenCalledWith(
        "https://www.googleapis.com/youtube/v3/search",
        expect.objectContaining({
          params: expect.objectContaining({
            q: "variables tutorial for beginners basics -shorts -song -music",
            part: "snippet",
            type: "video",
            maxResults: 4,
            videoDefinition: "any",
            safeSearch: "strict",
            order: "rating",
          }),
          timeout: 10000,
        }),
      );
    });

    it("should build intermediate-contextualized query with medium duration", async () => {
      const mockResponse: YouTubeSearchResponse = { items: [] };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const service = new YouTubeService();
      await service.searchVideos(["react", "hooks"], "intermediate");

      expect(axios.get).toHaveBeenCalledWith(
        "https://www.googleapis.com/youtube/v3/search",
        expect.objectContaining({
          params: expect.objectContaining({
            q: "react hooks intermediate guide in depth -shorts -song -music",
            part: "snippet",
            type: "video",
            maxResults: 4,
            videoDefinition: "any",
            safeSearch: "strict",
            order: "rating",
          }),
          timeout: 10000,
        }),
      );
    });

    it("should build advanced-contextualized query with long duration", async () => {
      const mockResponse: YouTubeSearchResponse = { items: [] };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const service = new YouTubeService();
      await service.searchVideos(["memory", "management"], "advanced");

      expect(axios.get).toHaveBeenCalledWith(
        "https://www.googleapis.com/youtube/v3/search",
        expect.objectContaining({
          params: expect.objectContaining({
            q: "memory management advanced deep dive architecture -shorts -song -music",
            part: "snippet",
            type: "video",
            maxResults: 4,
            videoDefinition: "any",
            safeSearch: "strict",
            order: "rating",
          }),
          timeout: 10000,
        }),
      );
    });

    it("should handle 500 server error gracefully", async () => {
      const error: AxiosError = new Error(
        "Request failed with status code 500",
      ) as AxiosError;
      error.response = { status: 500 };

      vi.mocked(axios.get).mockRejectedValue(error);

      const service = new YouTubeService();
      const results = await service.searchVideos(["react"]);

      expect(results).toEqual([]);
    });
  });
});
