import { describe, it, expect, beforeEach, vi } from "vitest";
import { SubmitProject } from "@application/use-cases/assessment/SubmitProject";
import { IProjectSubmissionRepository } from "@domain/assessment/repositories/IProjectSubmissionRepository";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { GitHubService } from "@infrastructure/services/GitHubService";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";
import type {
  AnalyzeProjectInput,
  AnalyzeProjectOutput,
} from "@infrastructure/ai/flows/analyzeProjectFlow";

/**
 * Unit tests for SubmitProject Use Case
 *
 * Tests the project submission workflow following TDD principles.
 * CRITICAL: Must validate that RoadmapItem.type === 'project'
 */

describe("SubmitProject Use Case", () => {
  let submitProject: SubmitProject;
  let mockProjectSubmissionRepo: IProjectSubmissionRepository;
  let mockRoadmapRepo: IRoadmapRepository;
  let mockGitHubService: GitHubService;
  let mockAnalyzeProjectFlow: (
    input: AnalyzeProjectInput,
  ) => Promise<AnalyzeProjectOutput>;

  beforeEach(() => {
    // Mock repositories
    mockProjectSubmissionRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByRoadmapItemId: vi.fn(),
    };

    mockRoadmapRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findOwnerUserId: vi.fn(),
      findLatestByUserId: vi.fn(),
      findAllByUserId: vi.fn(),
    };

    // Mock GitHubService
    mockGitHubService = {
      analyzeProfile: vi.fn(),
      analyzeRepository: vi.fn(),
    } as unknown as GitHubService;

    // Mock AI flow
    mockAnalyzeProjectFlow = vi.fn() as unknown as (
      input: AnalyzeProjectInput,
    ) => Promise<AnalyzeProjectOutput>;

    submitProject = new SubmitProject(
      mockProjectSubmissionRepo,
      mockRoadmapRepo,
      mockGitHubService,
      mockAnalyzeProjectFlow,
    );
  });

  describe("Type Validation (CRITICAL)", () => {
    it("should throw error if RoadmapItem.type is NOT 'project'", async () => {
      const roadmapId = RoadmapId.create("roadmap-123");
      const roadmapItemId = RoadmapItemId.create("item-123");

      // Create a THEORY item (not PROJECT)
      const theoryItem = RoadmapItem.create(
        roadmapItemId,
        "Learn TypeScript",
        "Study TypeScript fundamentals",
        1,
        { type: "theory" },
      );

      const roadmap = Roadmap.reconstitute(
        roadmapId,
        CareerGoalId.create("goal-123"),
        "Backend Developer Roadmap",
        [theoryItem],
        new Date(),
        new Date(),
      );

      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);

      await expect(
        submitProject.execute({
          roadmapId: "roadmap-123",
          roadmapItemId: "item-123",
          repoUrl: "https://github.com/user/repo",
        }),
      ).rejects.toThrow("This roadmap item is not a PROJECT");
    });

    it("should accept RoadmapItem.type === 'project'", async () => {
      const roadmapId = RoadmapId.create("roadmap-123");
      const roadmapItemId = RoadmapItemId.create("item-123");

      // Create a PROJECT item
      const projectItem = RoadmapItem.create(
        roadmapItemId,
        "Build REST API",
        "Create a REST API with TypeScript",
        1,
        { type: "project" },
      );

      const roadmap = Roadmap.reconstitute(
        roadmapId,
        CareerGoalId.create("goal-123"),
        "Backend Developer Roadmap",
        [projectItem],
        new Date(),
        new Date(),
      );

      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
      vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
        UserId.create("user-123"),
      );
      vi.mocked(mockGitHubService.analyzeRepository).mockResolvedValue({
        files: [{ path: "README.md", content: "# Project" }],
        metadata: { repoUrl: "https://github.com/user/repo", fileCount: 1 },
      });
      vi.mocked(mockAnalyzeProjectFlow).mockResolvedValue({
        score: 85,
        feedback: "Great project!",
        strengths: ["Clean code"],
        improvements: ["Add tests"],
      });

      const result = await submitProject.execute({
        roadmapId: "roadmap-123",
        roadmapItemId: "item-123",
        repoUrl: "https://github.com/user/repo",
      });

      expect(result).toBeDefined();
      expect(result.score).toBe(85);
    });
  });

  describe("GitHub URL Validation", () => {
    it("should reject invalid GitHub URLs", async () => {
      await expect(
        submitProject.execute({
          roadmapId: "roadmap-123",
          roadmapItemId: "item-123",
          repoUrl: "https://evil.com/user/repo",
        }),
      ).rejects.toThrow("Invalid GitHub repository URL");
    });

    it("should reject empty URLs", async () => {
      await expect(
        submitProject.execute({
          roadmapId: "roadmap-123",
          roadmapItemId: "item-123",
          repoUrl: "",
        }),
      ).rejects.toThrow("Invalid GitHub repository URL");
    });

    it("should accept valid GitHub URLs", async () => {
      const roadmapId = RoadmapId.create("roadmap-123");
      const roadmapItemId = RoadmapItemId.create("item-123");

      const projectItem = RoadmapItem.create(
        roadmapItemId,
        "Build REST API",
        "Create a REST API",
        1,
        { type: "project" },
      );

      const roadmap = Roadmap.reconstitute(
        roadmapId,
        CareerGoalId.create("goal-123"),
        "Roadmap",
        [projectItem],
        new Date(),
        new Date(),
      );

      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
      vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
        UserId.create("user-123"),
      );
      vi.mocked(mockGitHubService.analyzeRepository).mockResolvedValue({
        files: [{ path: "README.md", content: "# Project" }],
        metadata: { repoUrl: "https://github.com/user/repo", fileCount: 1 },
      });
      vi.mocked(mockAnalyzeProjectFlow).mockResolvedValue({
        score: 85,
        feedback: "Great!",
        strengths: [],
        improvements: [],
      });

      const result = await submitProject.execute({
        roadmapId: "roadmap-123",
        roadmapItemId: "item-123",
        repoUrl: "https://github.com/user/repo",
      });

      expect(result).toBeDefined();
    });
  });

  describe("Successful Flow", () => {
    it("should orchestrate: Validate -> Fetch Code -> Analyze -> Save", async () => {
      const roadmapId = RoadmapId.create("roadmap-123");
      const roadmapItemId = RoadmapItemId.create("item-123");

      const projectItem = RoadmapItem.create(
        roadmapItemId,
        "Build E-commerce API",
        "Create a full-featured e-commerce API",
        1,
        { type: "project", tags: ["node", "express", "postgres"] },
      );

      const roadmap = Roadmap.reconstitute(
        roadmapId,
        CareerGoalId.create("goal-123"),
        "Backend Developer Roadmap",
        [projectItem],
        new Date(),
        new Date(),
      );

      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
      vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
        UserId.create("user-123"),
      );

      const mockRepoData = {
        files: [
          { path: "README.md", content: "# E-commerce API" },
          { path: "package.json", content: '{"name": "api"}' },
          { path: "src/index.ts", content: "const app = express();" },
        ],
        metadata: {
          repoUrl: "https://github.com/user/ecommerce-api",
          fileCount: 3,
        },
      };

      vi.mocked(mockGitHubService.analyzeRepository).mockResolvedValue(
        mockRepoData,
      );

      const mockAIResult = {
        score: 92,
        feedback:
          "Excellent project! Well-structured code with proper separation of concerns.",
        strengths: [
          "Clean architecture",
          "Good error handling",
          "Comprehensive README",
        ],
        improvements: ["Add integration tests", "Implement rate limiting"],
      };

      vi.mocked(mockAnalyzeProjectFlow).mockResolvedValue(mockAIResult);

      const result = await submitProject.execute({
        roadmapId: "roadmap-123",
        roadmapItemId: "item-123",
        repoUrl: "https://github.com/user/ecommerce-api",
      });

      // Verify flow orchestration
      expect(mockRoadmapRepo.findById).toHaveBeenCalledWith(roadmapId);
      expect(mockRoadmapRepo.findOwnerUserId).toHaveBeenCalledWith(roadmapId);
      expect(mockGitHubService.analyzeRepository).toHaveBeenCalledWith(
        "https://github.com/user/ecommerce-api",
      );
      expect(mockAnalyzeProjectFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          repoUrl: "https://github.com/user/ecommerce-api",
          files: mockRepoData.files,
          topic: "Build E-commerce API",
          description: "Create a full-featured e-commerce API",
          expectedSkills: expect.any(String),
        }),
      );
      expect(mockProjectSubmissionRepo.save).toHaveBeenCalled();

      // Verify result
      expect(result.score).toBe(92);
      expect(result.feedback).toContain("Excellent project");
      expect(result.passed).toBe(true);
      expect(result.submissionId).toBeDefined();
    });

    it("should mark roadmap item as completed if score >= 70", async () => {
      const roadmapId = RoadmapId.create("roadmap-123");
      const roadmapItemId = RoadmapItemId.create("item-123");

      const projectItem = RoadmapItem.create(
        roadmapItemId,
        "Project",
        "Description",
        1,
        { type: "project" },
      );

      const roadmap = Roadmap.reconstitute(
        roadmapId,
        CareerGoalId.create("goal-123"),
        "Roadmap",
        [projectItem],
        new Date(),
        new Date(),
      );

      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
      vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
        UserId.create("user-123"),
      );
      vi.mocked(mockGitHubService.analyzeRepository).mockResolvedValue({
        files: [{ path: "README.md", content: "# Project" }],
        metadata: { repoUrl: "https://github.com/user/repo", fileCount: 1 },
      });
      vi.mocked(mockAnalyzeProjectFlow).mockResolvedValue({
        score: 85,
        feedback: "Great!",
        strengths: [],
        improvements: [],
      });

      await submitProject.execute({
        roadmapId: "roadmap-123",
        roadmapItemId: "item-123",
        repoUrl: "https://github.com/user/repo",
      });

      // Verify roadmap was saved with updated status
      expect(mockRoadmapRepo.save).toHaveBeenCalled();
      const mockSave = mockRoadmapRepo.save as ReturnType<typeof vi.fn>;
      const savedRoadmap = mockSave.mock.calls[0][0];
      const item = savedRoadmap.items.find(
        (i: RoadmapItem) => i.id.value === "item-123",
      );
      expect(item?.status).toBe("completed");
    });

    it("should NOT mark roadmap item as completed if score < 70", async () => {
      const roadmapId = RoadmapId.create("roadmap-123");
      const roadmapItemId = RoadmapItemId.create("item-123");

      const projectItem = RoadmapItem.create(
        roadmapItemId,
        "Project",
        "Description",
        1,
        { type: "project" },
      );

      const roadmap = Roadmap.reconstitute(
        roadmapId,
        CareerGoalId.create("goal-123"),
        "Roadmap",
        [projectItem],
        new Date(),
        new Date(),
      );

      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
      vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
        UserId.create("user-123"),
      );
      vi.mocked(mockGitHubService.analyzeRepository).mockResolvedValue({
        files: [{ path: "README.md", content: "# Project" }],
        metadata: { repoUrl: "https://github.com/user/repo", fileCount: 1 },
      });
      vi.mocked(mockAnalyzeProjectFlow).mockResolvedValue({
        score: 55,
        feedback: "Needs improvement",
        strengths: [],
        improvements: ["Add more features"],
      });

      const result = await submitProject.execute({
        roadmapId: "roadmap-123",
        roadmapItemId: "item-123",
        repoUrl: "https://github.com/user/repo",
      });

      expect(result.passed).toBe(false);

      // Verify roadmap item status is NOT completed
      const mockSave = mockRoadmapRepo.save as ReturnType<typeof vi.fn>;
      if (mockSave.mock.calls.length > 0) {
        const savedRoadmap = mockSave.mock.calls[0][0];
        const item = savedRoadmap.items.find(
          (i: RoadmapItem) => i.id.value === "item-123",
        );
        expect(item?.status).not.toBe("completed");
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle roadmap not found", async () => {
      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(null);

      await expect(
        submitProject.execute({
          roadmapId: "invalid-roadmap",
          roadmapItemId: "item-123",
          repoUrl: "https://github.com/user/repo",
        }),
      ).rejects.toThrow("Roadmap not found");
    });

    it("should handle roadmap item not found", async () => {
      const roadmapId = RoadmapId.create("roadmap-123");
      const roadmap = Roadmap.reconstitute(
        roadmapId,
        CareerGoalId.create("goal-123"),
        "Roadmap",
        [], // No items
        new Date(),
        new Date(),
      );

      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);

      await expect(
        submitProject.execute({
          roadmapId: "roadmap-123",
          roadmapItemId: "nonexistent-item",
          repoUrl: "https://github.com/user/repo",
        }),
      ).rejects.toThrow("Roadmap item not found");
    });

    it("should handle GitHub API errors", async () => {
      const roadmapId = RoadmapId.create("roadmap-123");
      const roadmapItemId = RoadmapItemId.create("item-123");

      const projectItem = RoadmapItem.create(
        roadmapItemId,
        "Project",
        "Description",
        1,
        { type: "project" },
      );

      const roadmap = Roadmap.reconstitute(
        roadmapId,
        CareerGoalId.create("goal-123"),
        "Roadmap",
        [projectItem],
        new Date(),
        new Date(),
      );

      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
      vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
        UserId.create("user-123"),
      );
      vi.mocked(mockGitHubService.analyzeRepository).mockRejectedValue(
        new Error("Repository not found or is private"),
      );

      await expect(
        submitProject.execute({
          roadmapId: "roadmap-123",
          roadmapItemId: "item-123",
          repoUrl: "https://github.com/user/private-repo",
        }),
      ).rejects.toThrow("Repository not found or is private");
    });

    it("should handle AI analysis failures", async () => {
      const roadmapId = RoadmapId.create("roadmap-123");
      const roadmapItemId = RoadmapItemId.create("item-123");

      const projectItem = RoadmapItem.create(
        roadmapItemId,
        "Project",
        "Description",
        1,
        { type: "project" },
      );

      const roadmap = Roadmap.reconstitute(
        roadmapId,
        CareerGoalId.create("goal-123"),
        "Roadmap",
        [projectItem],
        new Date(),
        new Date(),
      );

      vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
      vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
        UserId.create("user-123"),
      );
      vi.mocked(mockGitHubService.analyzeRepository).mockResolvedValue({
        files: [{ path: "README.md", content: "# Project" }],
        metadata: { repoUrl: "https://github.com/user/repo", fileCount: 1 },
      });
      vi.mocked(mockAnalyzeProjectFlow).mockRejectedValue(
        new Error("AI service unavailable"),
      );

      await expect(
        submitProject.execute({
          roadmapId: "roadmap-123",
          roadmapItemId: "item-123",
          repoUrl: "https://github.com/user/repo",
        }),
      ).rejects.toThrow("AI service unavailable");
    });
  });
});
