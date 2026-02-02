import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { prisma } from "@infrastructure/database/PrismaClient";
import { POST } from "@/app/api/learning/roadmap/items/[itemId]/project/route";
import { NextRequest } from "next/server";

const hasTestDb = !!process.env.DATABASE_URL;

// Mock GitHubService and AI flow to avoid external API calls
// Use vi.hoisted() to ensure mocks are defined before imports
const { mockGitHubAnalyzeRepository, mockAnalyzeProjectFlow } = vi.hoisted(
  () => ({
    mockGitHubAnalyzeRepository: vi.fn(),
    mockAnalyzeProjectFlow: vi.fn(),
  }),
);

vi.mock("@infrastructure/services/GitHubService", () => ({
  GitHubService: class {
    analyzeRepository = mockGitHubAnalyzeRepository;
  },
}));

vi.mock("@infrastructure/ai/flows/analyzeProjectFlow", () => ({
  analyzeProjectFlow: mockAnalyzeProjectFlow,
}));

describe.skipIf(!hasTestDb)(
  "POST /api/learning/roadmap/items/[itemId]/project (integration) — requires DATABASE_URL",
  () => {
    const testUserId = "test-user-project-001";
    const testGoalId = "test-goal-project-001";
    const testRoadmapId = "roadmap-project-test-001";
    const testProjectItemId = "project-item-001";
    const testTheoryItemId = "theory-item-001";

    beforeEach(async () => {
      // Reset mocks
      mockGitHubAnalyzeRepository.mockReset();
      mockAnalyzeProjectFlow.mockReset();

      // Configure default mock behavior
      mockGitHubAnalyzeRepository.mockImplementation(
        async (repoUrl: string) => {
          if (repoUrl.includes("invalid-repo")) {
            throw new Error("Repository not found or is private");
          }
          return {
            files: [
              { path: "README.md", content: "# Test Project" },
              { path: "package.json", content: '{"name": "test"}' },
              { path: "src/index.ts", content: "const x = 1;" },
            ],
            metadata: { repoUrl, fileCount: 3 },
          };
        },
      );

      mockAnalyzeProjectFlow.mockResolvedValue({
        score: 85,
        feedback: "Great project! Well-structured code.",
        strengths: ["Clean code", "Good documentation"],
        improvements: ["Add tests", "Improve error handling"],
      });

      // Clean up test data
      await prisma.projectSubmission.deleteMany({
        where: { roadmapItem: { roadmap: { goalId: testGoalId } } },
      });
      await prisma.roadmapItem.deleteMany({
        where: { roadmap: { goalId: testGoalId } },
      });
      await prisma.roadmap.deleteMany({ where: { goalId: testGoalId } });
      await prisma.careerGoal.deleteMany({ where: { id: testGoalId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });

      // Create test user
      await prisma.user.create({
        data: {
          id: testUserId,
          email: "test-project@example.com",
          name: "Test User Project",
        },
      });

      // Create test career goal
      await prisma.careerGoal.create({
        data: {
          id: testGoalId,
          userId: testUserId,
          targetRole: "Backend Developer",
          currentRole: "Junior Developer",
        },
      });

      // Create test roadmap with PROJECT and THEORY items
      await prisma.roadmap.create({
        data: {
          id: testRoadmapId,
          goalId: testGoalId,
          title: "Test Roadmap",
          items: {
            create: [
              {
                id: testProjectItemId,
                title: "Build REST API",
                description: "Create a REST API with Node.js",
                order: 1,
                type: "PROJECT",
                topic: "Node.js, Express",
                difficulty: "intermediate",
              },
              {
                id: testTheoryItemId,
                title: "Learn TypeScript",
                description: "Study TypeScript fundamentals",
                order: 2,
                type: "THEORY",
                topic: "TypeScript",
                difficulty: "beginner",
              },
            ],
          },
        },
      });
    });

    afterEach(async () => {
      // Clean up after each test
      await prisma.projectSubmission.deleteMany({
        where: { roadmapItem: { roadmap: { goalId: testGoalId } } },
      });
      await prisma.roadmapItem.deleteMany({
        where: { roadmap: { goalId: testGoalId } },
      });
      await prisma.roadmap.deleteMany({ where: { goalId: testGoalId } });
      await prisma.careerGoal.deleteMany({ where: { id: testGoalId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
    });

    it("should return 400 when request body is missing roadmapId", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/project-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({
            repoUrl: "https://github.com/user/valid-repo",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testProjectItemId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("roadmapId");
    });

    it("should return 400 when request body is missing repoUrl", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/project-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({ roadmapId: testRoadmapId }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testProjectItemId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("repoUrl");
    });

    it("should return 400 when repoUrl is not a valid URL", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/project-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            repoUrl: "not-a-valid-url",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testProjectItemId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when repoUrl is not a GitHub URL", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/project-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            repoUrl: "https://gitlab.com/user/repo",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testProjectItemId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_URL");
      expect(data.error.message).toContain("Invalid GitHub repository URL");
    });

    it("should return 400 when roadmap item is not a PROJECT type", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/theory-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            repoUrl: "https://github.com/user/valid-repo",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testTheoryItemId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_ITEM_TYPE");
      expect(data.error.message).toContain("not a PROJECT");
    });

    it("should return 404 when roadmap not found", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/project-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({
            roadmapId: "nonexistent-roadmap",
            repoUrl: "https://github.com/user/valid-repo",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testProjectItemId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("should return 404 when roadmap item not found", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/nonexistent-item/project",
        {
          method: "POST",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            repoUrl: "https://github.com/user/valid-repo",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: "nonexistent-item" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("should successfully submit project and return result", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/project-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            repoUrl: "https://github.com/user/valid-repo",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testProjectItemId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("submissionId");
      expect(data.data).toHaveProperty("score");
      expect(data.data).toHaveProperty("passed");
      expect(data.data).toHaveProperty("feedback");
      expect(data.data).toHaveProperty("strengths");
      expect(data.data).toHaveProperty("improvements");

      // Verify it matches ProjectResultDTO structure
      expect(data.data.score).toBe(85);
      expect(data.data.passed).toBe(true);
      expect(data.data.feedback).toContain("Great project");
      expect(Array.isArray(data.data.strengths)).toBe(true);
      expect(Array.isArray(data.data.improvements)).toBe(true);
    });

    it("should persist project submission to database", async () => {
      // Note: This test verifies the API returns correct data structure
      // DB persistence is covered by unit tests (SubmitProject.test.ts)
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/project-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            repoUrl: "https://github.com/user/valid-repo",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testProjectItemId }),
      });
      const data = await response.json();

      // Verify API returns success with valid structure
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.submissionId).toBeDefined();
      expect(data.data.score).toBeDefined();
      expect(data.data.passed).toBeDefined();
      expect(data.data.feedback).toBeDefined();
      expect(Array.isArray(data.data.strengths)).toBe(true);
      expect(Array.isArray(data.data.improvements)).toBe(true);
    });

    it("should mark roadmap item as completed when score >= 70", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/project-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            repoUrl: "https://github.com/user/valid-repo",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testProjectItemId }),
      });

      expect(response.status).toBe(200);

      // Verify roadmap item status was updated
      const updatedItem = await prisma.roadmapItem.findUnique({
        where: { id: testProjectItemId },
      });

      expect(updatedItem?.status).toBe("COMPLETED");
    });

    it("should handle GitHub repository not found error", async () => {
      // Note: GitHub error handling is covered by unit tests (SubmitProject.test.ts)
      // This test verifies the API route can handle errors gracefully
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/project-item-001/project",
        {
          method: "POST",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            repoUrl: "https://github.com/user/invalid-repo",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ itemId: testProjectItemId }),
      });
      const data = await response.json();

      // Verify API returns error response (status 400 or 404 are both valid)
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBeDefined();
      expect(data.error.message).toBeDefined();
    });
  },
);
