import axios from "axios";
import { LearningResource } from "@domain/learning/repositories/IResourceRepository";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";

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
    difficulty?: DifficultyLevel,
  ): Promise<LearningResource[]> {
    // Guard: Empty tags
    if (!tags || tags.length === 0) {
      return [];
    }

    try {
      // Build contextualized search query based on difficulty
      const query = this.buildQuery(tags, difficulty);
      // Call YouTube API (with 10s timeout)
      const videoDuration = this.getVideoDuration(difficulty);
      const response = await axios.get<YouTubeSearchResponse>(this.baseUrl, {
        params: {
          key: this.apiKey,
          q: query,
          part: "snippet",
          type: "video",
          maxResults: 4,
          videoDuration,
          safeSearch: "strict",
          order: "relevance",
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
  private buildQuery(tags: string[], difficulty?: DifficultyLevel): string {
    const baseTopic = tags.join(" ");
    const difficultyQualifier = this.getDifficultyQualifier(difficulty);
    const contentFilters = "-shorts -song -music"; // Block irrelevant content

    return `${baseTopic} ${difficultyQualifier} ${contentFilters}`.trim();
  }

  /**
   * Get difficulty-specific search qualifiers
   */
  private getDifficultyQualifier(difficulty?: DifficultyLevel): string {
    switch (difficulty) {
      case DifficultyLevel.Beginner:
        return "full course complete tutorial for beginners";
      case DifficultyLevel.Intermediate:
        return "full course complete guide in depth";
      case DifficultyLevel.Advanced:
        return "full course advanced deep dive masterclass";
      default:
        return "full course complete tutorial";
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
    _difficulty?: DifficultyLevel,
  ): "short" | "medium" | "long" | "any" {
    // Roadmap items always need comprehensive, in-depth content (20+ min)
    // regardless of difficulty level
    return "long";
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
