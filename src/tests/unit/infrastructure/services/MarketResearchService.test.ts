import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests for MarketResearchService
 *
 * Tests the service that manages caching logic between Database and AI.
 * Ensures 30-day cache rule, role validation, and AI flow integration.
 */

// Mock Prisma client
const mockFindUnique = vi.fn();
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();

vi.mock("@infrastructure/database/PrismaClient", () => ({
  prisma: {
    jobRole: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    marketReport: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// Mock analyzeMarketFlow
const mockAnalyzeMarketFlow = vi.fn();
vi.mock("@infrastructure/ai/flows/analyzeMarketFlow", () => ({
  analyzeMarketFlow: (...args: unknown[]) => mockAnalyzeMarketFlow(...args),
}));

// Import after mocks
import { MarketResearchService } from "@infrastructure/services/MarketResearchService";

describe("MarketResearchService", () => {
  let service: MarketResearchService;

  // Mock job role
  const mockJobRole = {
    id: "role-uuid-123",
    slug: "senior-frontend-developer",
    displayName: "Senior Frontend Developer",
    searchTerms: "frontend react typescript",
    category: "Engineering",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock market research data
  const mockMarketResearch = {
    salary: {
      currency: "USD",
      hourly: { min: 40, median: 65, max: 95 },
      annual: { min: 80000, median: 130000, max: 190000 },
    },
    demand: {
      score: 88,
      verdict: "High",
      trend: "Growing",
    },
    top_skills: [
      { name: "React", category: "Framework", relevance: 95 },
      { name: "TypeScript", category: "Language", relevance: 92 },
    ],
    analysis: {
      summary: "High demand for senior frontend developers.",
      key_growth_factor: "AI-driven web experiences",
      barrier_to_entry: "Medium",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MarketResearchService();
  });

  describe("role validation", () => {
    it("should throw error when role slug is not found in database", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        service.getMarketAnalysis("nonexistent-role"),
      ).rejects.toThrow("Role 'nonexistent-role' not found in catalog.");
    });

    it("should query role by slug", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue({
        data: mockMarketResearch,
        expiresAt: new Date(Date.now() + 86400000),
      });

      await service.getMarketAnalysis("senior-frontend-developer");

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { slug: "senior-frontend-developer" },
      });
    });
  });

  describe("cache hit (30-day rule)", () => {
    it("should return cached data when valid report exists", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue({
        data: mockMarketResearch,
        expiresAt: new Date(Date.now() + 86400000 * 15), // 15 days remaining
      });

      const result = await service.getMarketAnalysis(
        "senior-frontend-developer",
      );

      expect(result).toEqual(mockMarketResearch);
      expect(mockAnalyzeMarketFlow).not.toHaveBeenCalled();
    });

    it("should query cache with correct filters", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue({
        data: mockMarketResearch,
        expiresAt: new Date(Date.now() + 86400000),
      });

      await service.getMarketAnalysis("senior-frontend-developer", "Argentina");

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          roleId: "role-uuid-123",
          region: "Argentina",
          expiresAt: { gt: expect.any(Date) },
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should use GLOBAL as default region", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue({
        data: mockMarketResearch,
        expiresAt: new Date(Date.now() + 86400000),
      });

      await service.getMarketAnalysis("senior-frontend-developer");

      expect(mockFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            region: "GLOBAL",
          }),
        }),
      );
    });
  });

  describe("cache miss (generate new data)", () => {
    it("should call AI flow when no cached data exists", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue(null);
      mockAnalyzeMarketFlow.mockResolvedValue(mockMarketResearch);
      mockCreate.mockResolvedValue({ data: mockMarketResearch });

      await service.getMarketAnalysis("senior-frontend-developer");

      expect(mockAnalyzeMarketFlow).toHaveBeenCalledOnce();
    });

    it("should pass displayName to AI flow, not slug", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue(null);
      mockAnalyzeMarketFlow.mockResolvedValue(mockMarketResearch);
      mockCreate.mockResolvedValue({ data: mockMarketResearch });

      await service.getMarketAnalysis("senior-frontend-developer", "Brazil");

      expect(mockAnalyzeMarketFlow).toHaveBeenCalledWith({
        role: "Senior Frontend Developer",
        region: "Brazil",
      });
    });

    it("should save new report to database with correct data", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue(null);
      mockAnalyzeMarketFlow.mockResolvedValue(mockMarketResearch);
      mockCreate.mockResolvedValue({ data: mockMarketResearch });

      await service.getMarketAnalysis("senior-frontend-developer", "LATAM");

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          roleId: "role-uuid-123",
          region: "LATAM",
          data: mockMarketResearch,
          sourceType: "GENKIT_AUTO",
          expiresAt: expect.any(Date),
        },
      });
    });

    it("should set expiresAt to 30 days from now", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue(null);
      mockAnalyzeMarketFlow.mockResolvedValue(mockMarketResearch);
      mockCreate.mockResolvedValue({ data: mockMarketResearch });

      const beforeCall = Date.now();
      await service.getMarketAnalysis("senior-frontend-developer");
      const afterCall = Date.now();

      const createCall = mockCreate.mock.calls[0][0];
      const expiresAt = createCall.data.expiresAt.getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      // expiresAt should be approximately 30 days from now
      expect(expiresAt).toBeGreaterThanOrEqual(
        beforeCall + thirtyDaysMs - 1000,
      );
      expect(expiresAt).toBeLessThanOrEqual(afterCall + thirtyDaysMs + 1000);
    });

    it("should return the newly generated data", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue(null);
      mockAnalyzeMarketFlow.mockResolvedValue(mockMarketResearch);
      mockCreate.mockResolvedValue({ data: mockMarketResearch });

      const result = await service.getMarketAnalysis(
        "senior-frontend-developer",
      );

      expect(result).toEqual(mockMarketResearch);
    });
  });

  describe("error handling", () => {
    it("should propagate AI flow errors", async () => {
      mockFindUnique.mockResolvedValue(mockJobRole);
      mockFindFirst.mockResolvedValue(null);
      mockAnalyzeMarketFlow.mockRejectedValue(new Error("AI service failed"));

      await expect(
        service.getMarketAnalysis("senior-frontend-developer"),
      ).rejects.toThrow("AI service failed");
    });

    it("should propagate database errors", async () => {
      mockFindUnique.mockRejectedValue(new Error("Database connection failed"));

      await expect(
        service.getMarketAnalysis("senior-frontend-developer"),
      ).rejects.toThrow("Database connection failed");
    });
  });
});
