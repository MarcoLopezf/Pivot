import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests for analyzeMarketFlow
 *
 * Tests the Direct Retrieval (RAG) pattern with mocked Tavily and AI generation.
 * Updated for Career Ladder schema (Junior/Mid/Senior).
 */

// Mock Tavily
const mockSearch = vi.fn();
vi.mock("@tavily/core", () => ({
  tavily: vi.fn(() => ({
    search: mockSearch,
  })),
}));

// Mock the genkit config with defineFlow - use inline function to avoid hoisting issues
vi.mock("@infrastructure/ai/genkit.config", () => {
  const generateFn = vi.fn();
  return {
    ai: {
      generate: generateFn,
      defineFlow: vi.fn((_config, fn) => fn),
    },
  };
});

// Import after mocks
import { analyzeMarketFlow } from "@infrastructure/ai/flows/analyzeMarketFlow";
import { ai } from "@infrastructure/ai/genkit.config";

describe("analyzeMarketFlow", () => {
  const validMarketResearchOutput = {
    role: "Frontend Developer",
    region: "Argentina",
    salary_ladder: {
      junior: { min: 20, max: 35, median: 28, currency: "USD" },
      mid: { min: 35, max: 55, median: 45, currency: "USD" },
      senior: { min: 55, max: 85, median: 70, currency: "USD" },
    },
    demand: {
      score: 85,
      verdict: "High",
      trend: "Growing",
    },
    top_skills: [
      { name: "TypeScript", relevance: 95 },
      { name: "React", relevance: 90 },
    ],
    analysis: {
      summary: "Strong demand for developers in this market.",
      key_growth_factor: "AI integration driving demand",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set environment variable for test
    process.env.TAVILY_API_KEY = "test-api-key";

    // Default mock for Tavily search
    mockSearch.mockResolvedValue({
      results: [{ title: "Salary Data", content: "Average $50/hr" }],
      answer: "Mock search answer",
    });

    // Default mock for AI generate
    vi.mocked(ai.generate).mockResolvedValue({
      output: validMarketResearchOutput,
    } as never);
  });

  describe("successful generation", () => {
    it("should return valid market research data with career ladder", async () => {
      const result = await analyzeMarketFlow({
        role: "Frontend Developer",
        region: "Argentina",
      });

      expect(result).toEqual(validMarketResearchOutput);
    });

    it("should include junior, mid, and senior salary levels", async () => {
      const result = await analyzeMarketFlow({
        role: "Rust Developer",
        region: "LATAM",
      });

      expect(result.salary_ladder).toBeDefined();
      expect(result.salary_ladder.junior).toBeDefined();
      expect(result.salary_ladder.mid).toBeDefined();
      expect(result.salary_ladder.senior).toBeDefined();
    });

    it("should call Tavily search with strategic query", async () => {
      await analyzeMarketFlow({
        role: "Rust Developer",
        region: "Argentina",
      });

      expect(mockSearch).toHaveBeenCalledTimes(1);
      const searchQuery = mockSearch.mock.calls[0][0];
      expect(searchQuery).toContain("Rust Developer");
      expect(searchQuery).toContain("Argentina");
      expect(searchQuery).toContain("Junior");
      expect(searchQuery).toContain("Senior");
    });

    it("should call AI generate with search context", async () => {
      await analyzeMarketFlow({
        role: "Python Developer",
        region: "Global",
      });

      expect(ai.generate).toHaveBeenCalledTimes(1);
      const generateCall = vi.mocked(ai.generate).mock.calls[0][0];
      expect(generateCall.prompt).toContain("Python Developer");
      expect(generateCall.prompt).toContain("Global");
    });
  });

  describe("error handling", () => {
    it("should throw error if TAVILY_API_KEY is missing", async () => {
      delete process.env.TAVILY_API_KEY;

      await expect(
        analyzeMarketFlow({
          role: "Developer",
          region: "Argentina",
        }),
      ).rejects.toThrow("TAVILY_API_KEY is missing");
    });

    it("should handle Tavily search failure gracefully", async () => {
      mockSearch.mockRejectedValue(new Error("Tavily API error"));

      const result = await analyzeMarketFlow({
        role: "Developer",
        region: "Argentina",
      });

      // Should still return result from AI generation with fallback context
      expect(result).toEqual(validMarketResearchOutput);
    });

    it("should throw error if AI generation returns null output", async () => {
      vi.mocked(ai.generate).mockResolvedValue({ output: null } as never);

      await expect(
        analyzeMarketFlow({
          role: "Developer",
          region: "Argentina",
        }),
      ).rejects.toThrow("Failed to generate analysis");
    });
  });

  describe("input validation", () => {
    it("should pass role to search query", async () => {
      await analyzeMarketFlow({
        role: "Backend Engineer",
        region: "USA",
      });

      const searchQuery = mockSearch.mock.calls[0][0];
      expect(searchQuery).toContain("Backend Engineer");
    });

    it("should pass region to search query", async () => {
      await analyzeMarketFlow({
        role: "DevOps Engineer",
        region: "LATAM",
      });

      const searchQuery = mockSearch.mock.calls[0][0];
      expect(searchQuery).toContain("LATAM");
    });
  });
});
