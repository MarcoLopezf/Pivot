import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetItemResources } from "@application/use-cases/learning/GetItemResources";
import { IResourceRepository } from "@domain/learning/repositories/IResourceRepository";
import { YouTubeService } from "@infrastructure/services/YouTubeService";

/**
 * Unit tests for GetItemResources Use Case
 *
 * Tests lazy loading strategy:
 * 1. Try DB first (cache hit)
 * 2. Fall back to YouTube API if DB empty (cache miss)
 * 3. Save API results to DB for future requests
 * 4. Handle API failures gracefully
 */

// Mock LearningResource type
interface LearningResource {
  title: string;
  url: string;
  thumbnailUrl: string;
  channelName: string;
  duration?: string;
  type: "video" | "article" | "course";
  tags: string[];
}

describe("GetItemResources Use Case", () => {
  let mockRepository: IResourceRepository;
  let mockYouTubeService: YouTubeService;
  let useCase: GetItemResources;

  beforeEach(() => {
    // Mock repository
    mockRepository = {
      findByTags: vi.fn(),
      saveMany: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      upvote: vi.fn(),
      downvote: vi.fn(),
    };

    // Mock YouTube service
    mockYouTubeService = {
      searchVideos: vi.fn(),
    } as Partial<YouTubeService> as YouTubeService;

    useCase = new GetItemResources(mockRepository, mockYouTubeService);
  });

  describe("Lazy Loading - Cache Hit (DB)", () => {
    it("should return resources from DB and NOT call YouTube API", async () => {
      const mockDbResources: LearningResource[] = [
        {
          title: "React Hooks Tutorial",
          url: "https://www.youtube.com/watch?v=abc123",
          thumbnailUrl: "https://i.ytimg.com/vi/abc123/maxresdefault.jpg",
          channelName: "Fireship",
          duration: "10:05",
          type: "video",
          tags: ["react", "hooks"],
        },
        {
          title: "Advanced React Patterns",
          url: "https://www.youtube.com/watch?v=xyz789",
          thumbnailUrl: "https://i.ytimg.com/vi/xyz789/maxresdefault.jpg",
          channelName: "Net Ninja",
          duration: "25:30",
          type: "video",
          tags: ["react", "patterns"],
        },
        {
          title: "React State Management",
          url: "https://www.youtube.com/watch?v=def456",
          thumbnailUrl: "https://i.ytimg.com/vi/def456/maxresdefault.jpg",
          channelName: "Traversy Media",
          duration: "15:42",
          type: "video",
          tags: ["react", "state"],
        },
      ];

      vi.mocked(mockRepository.findByTags).mockResolvedValue(mockDbResources);

      const result = await useCase.execute("item-001", "React Basics");

      // Assert: Returns DB resources
      expect(result).toEqual(mockDbResources);
      expect(result).toHaveLength(3);

      // Assert: Repository was called with normalized tags
      expect(mockRepository.findByTags).toHaveBeenCalledOnce();
      expect(mockRepository.findByTags).toHaveBeenCalledWith(["react"]);

      // Assert: YouTube API was NEVER called (cache hit)
      expect(mockYouTubeService.searchVideos).not.toHaveBeenCalled();

      // Assert: saveMany was NEVER called (no new data)
      expect(mockRepository.saveMany).not.toHaveBeenCalled();
    });

    it("should normalize topic tags before querying DB", async () => {
      vi.mocked(mockRepository.findByTags).mockResolvedValue([]);
      vi.mocked(mockYouTubeService.searchVideos).mockResolvedValue([]);

      await useCase.execute("item-001", "ReactJS Basics Tutorial");

      // "ReactJS Basics Tutorial" -> ["react"] (normalized)
      expect(mockRepository.findByTags).toHaveBeenCalledWith(["react"]);
    });
  });

  describe("Lazy Loading - Cache Miss (API)", () => {
    it("should call YouTube API when DB returns empty and save results", async () => {
      const mockApiResources: LearningResource[] = [
        {
          title: "TypeScript Tutorial",
          url: "https://www.youtube.com/watch?v=new123",
          thumbnailUrl: "https://i.ytimg.com/vi/new123/maxresdefault.jpg",
          channelName: "Academind",
          duration: "30:00",
          type: "video",
          tags: ["typescript"],
        },
      ];

      // DB returns empty (cache miss)
      vi.mocked(mockRepository.findByTags).mockResolvedValue([]);

      // API returns results
      vi.mocked(mockYouTubeService.searchVideos).mockResolvedValue(
        mockApiResources,
      );

      // saveMany succeeds
      vi.mocked(mockRepository.saveMany).mockResolvedValue(undefined);

      const result = await useCase.execute("item-002", "TypeScript");

      // Assert: Returns API resources
      expect(result).toEqual(mockApiResources);
      expect(result).toHaveLength(1);

      // Assert: Repository was called first
      expect(mockRepository.findByTags).toHaveBeenCalledWith(["typescript"]);

      // Assert: YouTube API WAS called (cache miss) without difficulty
      expect(mockYouTubeService.searchVideos).toHaveBeenCalledOnce();
      expect(mockYouTubeService.searchVideos).toHaveBeenCalledWith(
        ["typescript"],
        undefined,
      );

      // Assert: Results were saved to DB
      expect(mockRepository.saveMany).toHaveBeenCalledOnce();
      expect(mockRepository.saveMany).toHaveBeenCalledWith(mockApiResources);
    });

    it("should pass difficulty parameter to YouTube API for contextualized search", async () => {
      const mockApiResources: LearningResource[] = [
        {
          title: "Advanced TypeScript Patterns",
          url: "https://www.youtube.com/watch?v=adv123",
          thumbnailUrl: "https://i.ytimg.com/vi/adv123/maxresdefault.jpg",
          channelName: "Total TypeScript",
          duration: "45:00",
          type: "video",
          tags: ["typescript"],
        },
      ];

      vi.mocked(mockRepository.findByTags).mockResolvedValue([]);
      vi.mocked(mockYouTubeService.searchVideos).mockResolvedValue(
        mockApiResources,
      );
      vi.mocked(mockRepository.saveMany).mockResolvedValue(undefined);

      await useCase.execute("item-002", "TypeScript", "advanced");

      // Assert: YouTube API called with difficulty parameter
      expect(mockYouTubeService.searchVideos).toHaveBeenCalledWith(
        ["typescript"],
        "advanced",
      );
    });

    it("should handle multiple normalized tags from topic", async () => {
      vi.mocked(mockRepository.findByTags).mockResolvedValue([]);
      vi.mocked(mockYouTubeService.searchVideos).mockResolvedValue([]);

      await useCase.execute("item-003", "Next.js and TypeScript Tutorial");

      // "Next.js and TypeScript Tutorial" -> ["next", "typescript"]
      expect(mockRepository.findByTags).toHaveBeenCalledWith([
        "next",
        "typescript",
      ]);
      expect(mockYouTubeService.searchVideos).toHaveBeenCalledWith(
        ["next", "typescript"],
        undefined,
      );
    });
  });

  describe("Hybrid Failover (API Failure)", () => {
    it("should return empty array when DB empty and API fails", async () => {
      // DB returns empty
      vi.mocked(mockRepository.findByTags).mockResolvedValue([]);

      // API fails (returns empty due to error handling)
      vi.mocked(mockYouTubeService.searchVideos).mockResolvedValue([]);

      const result = await useCase.execute("item-004", "Node.js");

      // Assert: Returns empty array (does not crash)
      expect(result).toEqual([]);

      // Assert: Both DB and API were attempted
      expect(mockRepository.findByTags).toHaveBeenCalledWith(["node"]);
      expect(mockYouTubeService.searchVideos).toHaveBeenCalledWith(
        ["node"],
        undefined,
      );

      // Assert: saveMany was NOT called (no data to save)
      expect(mockRepository.saveMany).not.toHaveBeenCalled();
    });

    it("should return empty array when tags cannot be normalized", async () => {
      // Topic with only stop words: "Tutorial Basics 101"
      vi.mocked(mockRepository.findByTags).mockResolvedValue([]);

      const result = await useCase.execute("item-005", "Tutorial Basics 101");

      // Assert: Returns empty (no valid tags after normalization)
      expect(result).toEqual([]);

      // Assert: Neither DB nor API called (invalid tags)
      expect(mockRepository.findByTags).not.toHaveBeenCalled();
      expect(mockYouTubeService.searchVideos).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should return empty array when topic is empty string", async () => {
      const result = await useCase.execute("item-006", "");

      expect(result).toEqual([]);
      expect(mockRepository.findByTags).not.toHaveBeenCalled();
      expect(mockYouTubeService.searchVideos).not.toHaveBeenCalled();
    });

    it("should return empty array when topic is whitespace", async () => {
      const result = await useCase.execute("item-007", "   ");

      expect(result).toEqual([]);
      expect(mockRepository.findByTags).not.toHaveBeenCalled();
      expect(mockYouTubeService.searchVideos).not.toHaveBeenCalled();
    });

    it("should propagate repository errors to caller", async () => {
      vi.mocked(mockRepository.findByTags).mockRejectedValue(
        new Error("DB connection error"),
      );

      // Should throw error (caller handles error response)
      await expect(useCase.execute("item-008", "React")).rejects.toThrow(
        "DB connection error",
      );
    });

    it("should not save to DB if API returns empty results", async () => {
      vi.mocked(mockRepository.findByTags).mockResolvedValue([]);
      vi.mocked(mockYouTubeService.searchVideos).mockResolvedValue([]);

      await useCase.execute("item-009", "Obscure Topic That Doesnt Exist");

      expect(mockRepository.saveMany).not.toHaveBeenCalled();
    });
  });
});
