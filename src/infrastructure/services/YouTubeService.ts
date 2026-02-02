import axios from "axios";
import { LearningResource } from "@domain/learning/repositories/IResourceRepository";

/**
 * YouTubeService
 *
 * Infrastructure service for fetching learning resources from YouTube Data API v3.
 * Handles API calls, error handling, and data mapping.
 *
 * API Documentation: https://developers.google.com/youtube/v3/docs/search/list
 */

/**
 * YouTube API Search Response Structure
 * Note: search.list only returns 'id' and 'snippet' parts
 */
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

export class YouTubeService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://www.googleapis.com/youtube/v3/search";

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || "";

    if (!this.apiKey) {
      console.warn(
        "[YouTubeService] YOUTUBE_API_KEY not set. YouTube search will fail.",
      );
    }
  }

  /**
   * Search YouTube videos by tags
   *
   * Returns empty array on error to prevent crashes (fail-safe design).
   * Logs errors for debugging.
   */
  async searchVideos(tags: string[]): Promise<LearningResource[]> {
    // Guard: Empty tags
    if (!tags || tags.length === 0) {
      return [];
    }

    try {
      // Build search query from tags
      const query = tags.join(" ");

      // Call YouTube API
      const response = await axios.get<YouTubeSearchResponse>(this.baseUrl, {
        params: {
          key: this.apiKey,
          q: query,
          part: "snippet",
          type: "video",
          maxResults: 4,
          videoDefinition: "any",
          safeSearch: "strict",
        },
      });

      // Map YouTube response to LearningResource
      return this.mapYouTubeResponse(response.data, tags);
    } catch (error) {
      // Log error but return empty array (fail-safe)
      console.error("[YouTubeService] Error fetching videos:", error);
      return [];
    }
  }

  /**
   * Map YouTube API response to LearningResource objects
   * Note: Duration is not available from search.list endpoint
   */
  private mapYouTubeResponse(
    response: YouTubeSearchResponse,
    tags: string[],
  ): LearningResource[] {
    if (!response.items || response.items.length === 0) {
      return [];
    }

    return response.items.map((item) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      channelName: item.snippet.channelTitle,
      type: "video" as const,
      tags,
    }));
  }
}
