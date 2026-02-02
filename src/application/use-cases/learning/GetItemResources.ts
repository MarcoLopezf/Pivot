import {
  IResourceRepository,
  LearningResource,
} from "@domain/learning/repositories/IResourceRepository";
import { YouTubeService } from "@infrastructure/services/YouTubeService";
import { TagNormalizer } from "@domain/shared/services/TagNormalizer";

/**
 * GetItemResources Use Case
 *
 * Retrieves learning resources (videos) for a roadmap item using lazy loading strategy:
 *
 * 1. **Try DB first** (cache hit) - Return existing resources if available
 * 2. **Fall back to API** (cache miss) - Fetch from YouTube if DB is empty
 * 3. **Save API results** - Store in DB for future requests (warm cache)
 * 4. **Fail gracefully** - Return empty array on errors (never crash)
 *
 * Benefits:
 * - Reduces YouTube API quota usage (expensive)
 * - Fast response for cached items
 * - Always returns data (DB or API)
 *
 * Example:
 * ```
 * Topic: "React Hooks Basics"
 * Tags (normalized): ["react", "hooks"]
 * DB: Empty -> Fetch from YouTube -> Save to DB -> Return videos
 * ```
 */

export class GetItemResources {
  constructor(
    private readonly resourceRepository: IResourceRepository,
    private readonly youtubeService: YouTubeService,
  ) {}

  /**
   * Execute the use case
   *
   * @param itemId - Roadmap item ID (for logging/future features)
   * @param topic - The topic to search for (e.g., "React Hooks", "TypeScript Generics")
   * @returns Array of learning resources (videos)
   */
  async execute(itemId: string, topic: string): Promise<LearningResource[]> {
    try {
      // Step 1: Normalize topic into tags using TagNormalizer
      const normalizedTags = this.normalizeTopic(topic);

      // Guard: No valid tags after normalization
      if (normalizedTags.length === 0) {
        return [];
      }

      // Step 2: Try DB first (cache hit)
      const dbResources =
        await this.resourceRepository.findByTags(normalizedTags);

      if (dbResources.length > 0) {
        // Cache hit! Return DB resources
        return dbResources;
      }

      // Step 3: Cache miss - Fetch from YouTube API
      const apiResources =
        await this.youtubeService.searchVideos(normalizedTags);

      // Step 4: Save API results to DB (if any)
      if (apiResources.length > 0) {
        await this.resourceRepository.saveMany(apiResources);
      }

      // Step 5: Return API resources (or empty array if API failed)
      return apiResources;
    } catch (error) {
      // Fail gracefully - log error and return empty
      console.error("[GetItemResources] Error:", error);
      return [];
    }
  }

  /**
   * Normalize topic string into clean tags
   *
   * Examples:
   * - "React Hooks Basics" -> ["react", "hooks"]
   * - "Next.js and TypeScript" -> ["next", "typescript"]
   * - "Tutorial 101" -> [] (only stop words)
   */
  private normalizeTopic(topic: string): string[] {
    if (!topic || topic.trim() === "") {
      return [];
    }

    // Common words to filter out (conjunctions, articles, etc.)
    const filterWords = new Set([
      "and",
      "or",
      "the",
      "a",
      "an",
      "for",
      "to",
      "with",
      "in",
      "on",
      "at",
      "from",
    ]);

    // Stop words to filter AFTER normalization
    const stopWords = new Set([
      "intro",
      "introduction",
      "basics",
      "basic",
      "advanced",
      "tutorial",
      "guide",
      "101",
      "fundamentals",
      "overview",
      "concept",
      "concepts",
      "mastering",
    ]);

    // Split by common separators and normalize each token
    const tokens = topic.split(/[\s,&]+/);

    // Filter out common words before normalization
    const filteredTokens = tokens.filter(
      (token) => !filterWords.has(token.toLowerCase()),
    );

    const normalized = TagNormalizer.normalizeMany(filteredTokens);

    // Filter out stop words AFTER normalization
    const finalTags = normalized.filter((tag) => !stopWords.has(tag));

    return finalTags;
  }
}
