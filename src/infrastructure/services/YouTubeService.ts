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
   * Search YouTube videos by tags with difficulty-based contextualization
   *
   * Returns empty array on error to prevent crashes (fail-safe design).
   * Logs errors for debugging.
   *
   * @param tags - Search keywords/topics
   * @param difficulty - Learning level: 'beginner', 'intermediate', or 'advanced'
   */
  async searchVideos(
    tags: string[],
    difficulty?: string,
  ): Promise<LearningResource[]> {
    // Guard: Empty tags
    if (!tags || tags.length === 0) {
      return [];
    }

    try {
      // Build contextualized search query based on difficulty
      const query = this.buildQuery(tags, difficulty);
      console.log("query", query);
      // Call YouTube API (with 10s timeout)
      const response = await axios.get<YouTubeSearchResponse>(this.baseUrl, {
        params: {
          key: this.apiKey,
          q: query,
          part: "snippet",
          type: "video",
          maxResults: 4,
          videoDefinition: "any",
          safeSearch: "strict",
          order: "rating",
        },
        timeout: 10000, // 10 seconds
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
   * Build contextualized search query based on difficulty level
   *
   * Appends difficulty-specific qualifiers to avoid showing beginner tutorials
   * to advanced users, and vice versa.
   */
  private buildQuery(tags: string[], difficulty?: string): string {
    const baseTopic = tags.join(" ");
    const difficultyQualifier = this.getDifficultyQualifier(difficulty);
    const contentFilters = "-shorts -song -music"; // Block irrelevant content

    return `${baseTopic} ${difficultyQualifier} ${contentFilters}`.trim();
  }

  /**
   * Get difficulty-specific search qualifiers
   */
  private getDifficultyQualifier(difficulty?: string): string {
    const normalizedDifficulty = difficulty?.toLowerCase();

    switch (normalizedDifficulty) {
      case "beginner":
        return "tutorial for beginners basics";
      case "intermediate":
        return "intermediate guide in depth";
      case "advanced":
        return "advanced deep dive architecture";
      default:
        // Default to general tutorial if difficulty not specified
        return "tutorial guide";
    }
  }

  /**
   * Get video duration filter based on difficulty
   *
   * - Beginner: medium (4-20 min, focused tutorials)
   * - Intermediate: medium (balanced depth)
   * - Advanced: long (20+ min, in-depth content)
   */
  private getVideoDuration(
    difficulty?: string,
  ): "short" | "medium" | "long" | "any" {
    const normalizedDifficulty = difficulty?.toLowerCase();

    switch (normalizedDifficulty) {
      case "beginner":
        return "medium";
      case "intermediate":
        return "medium";
      case "advanced":
        return "long";
      default:
        return "medium";
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
