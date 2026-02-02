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
    contentDetails?: {
      duration: string; // ISO 8601 format: PT10M5S
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
            contentDetails: {
              duration: "PT10M5S", // 10 minutes 5 seconds
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
            contentDetails: {
              duration: "PT25M30S", // 25 minutes 30 seconds
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
      expect(results[0].duration).toBe("10:05");
      expect(results[0].tags).toEqual(["react", "hooks"]);
      expect(results[0].type).toBe("video");

      // Second video
      expect(results[1].title).toBe("TypeScript Advanced Patterns");
      expect(results[1].channelName).toBe("Net Ninja");
      expect(results[1].url).toBe("https://www.youtube.com/watch?v=video456");
      expect(results[1].duration).toBe("25:30");
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

    it("should handle videos without contentDetails (duration)", async () => {
      const mockResponse: YouTubeSearchResponse = {
        items: [
          {
            id: { videoId: "video789" },
            snippet: {
              title: "Short Video",
              channelTitle: "Channel",
              thumbnails: {
                high: {
                  url: "https://i.ytimg.com/vi/video789/maxresdefault.jpg",
                },
              },
            },
            // No contentDetails
          },
        ],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const service = new YouTubeService();
      const results = await service.searchVideos(["test"]);

      expect(results).toHaveLength(1);
      expect(results[0].duration).toBeUndefined();
    });

    it("should build correct search query from tags", async () => {
      const mockResponse: YouTubeSearchResponse = { items: [] };
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const service = new YouTubeService();
      await service.searchVideos(["react", "hooks", "tutorial"]);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("https://www.googleapis.com/youtube/v3/search"),
        expect.objectContaining({
          params: expect.objectContaining({
            q: "react hooks tutorial",
            part: "snippet",
            type: "video",
            maxResults: 4,
          }),
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

    it("should parse ISO 8601 duration correctly", async () => {
      const mockResponse: YouTubeSearchResponse = {
        items: [
          {
            id: { videoId: "v1" },
            snippet: {
              title: "1 hour video",
              channelTitle: "Channel",
              thumbnails: { high: { url: "url" } },
            },
            contentDetails: {
              duration: "PT1H5M30S", // 1 hour, 5 minutes, 30 seconds
            },
          },
          {
            id: { videoId: "v2" },
            snippet: {
              title: "Short video",
              channelTitle: "Channel",
              thumbnails: { high: { url: "url" } },
            },
            contentDetails: {
              duration: "PT45S", // 45 seconds
            },
          },
        ],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const service = new YouTubeService();
      const results = await service.searchVideos(["test"]);

      expect(results[0].duration).toBe("1:05:30");
      expect(results[1].duration).toBe("0:45");
    });
  });
});
