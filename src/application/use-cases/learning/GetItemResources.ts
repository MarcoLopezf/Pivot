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
 * 4. **Error handling** - Throws exceptions for DB/API errors (caller handles error responses)
 *
 * Benefits:
 * - Reduces YouTube API quota usage (expensive)
 * - Fast response for cached items
 * - Clear distinction between "no resources" vs "error occurred"
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
   * @param tags - Array of atomic tags (e.g., ["react", "hooks"])
   * @param difficulty - Learning level: 'beginner', 'intermediate', or 'advanced'
   * @returns Array of learning resources (videos)
   * @throws Error if database or YouTube API fails
   */
  async execute(
    itemId: string,
    tags: string[],
    difficulty?: string,
  ): Promise<LearningResource[]> {
    // Step 1: Normalize tags
    const normalizedTags = TagNormalizer.normalizeMany(tags);

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

    // Step 3: Cache miss - Fetch from YouTube API with difficulty context
    const apiResources = await this.youtubeService.searchVideos(
      normalizedTags,
      difficulty,
    );

    // Step 4: Save API results to DB (if any)
    if (apiResources.length > 0) {
      await this.resourceRepository.saveMany(apiResources);
    }

    // Step 5: Return API resources (or empty array if none found)
    return apiResources;
  }
}
