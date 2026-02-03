import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests for analyzeMarketFlow
 *
 * Tests the Direct Retrieval (RAG) pattern with mocked Tavily and AI generation.
 */

// Mock Tavily
const mockSearch = vi.fn();
vi.mock("@tavily/core", () => ({
  tavily: vi.fn(() => ({
    search: mockSearch,
  })),
}));

// Mock the genkit config
vi.mock("@infrastructure/ai/genkit.config", () => ({
  ai: {
    generate: vi.fn(),
  },
}));

// Mock openAI model
vi.mock("@genkit-ai/compat-oai/openai", () => ({
  openAI: {
    model: vi.fn().mockReturnValue("mocked-gpt-4o-mini"),
  },
}));

// Import after mocks
import { analyzeMarketFlow } from "@infrastructure/ai/flows/analyzeMarketFlow";
import { ai } from "@infrastructure/ai/genkit.config";

describe("analyzeMarketFlow", () => {
  const validMarketResearchOutput = {
    salary: {
      currency: "USD",
      hourly: { min: 25, median: 45, max: 75 },
      annual: { min: 50000, median: 90000, max: 150000 },
    },
    demand: {
      score: 85,
      verdict: "High",
      trend: "Growing",
    },
    top_skills: [
      { name: "TypeScript", category: "Language", relevance: 95 },
      { name: "React", category: "Framework", relevance: 90 },
    ],
    analysis: {
      summary: "Strong demand for developers in this market.",
      key_growth_factor: "AI integration driving demand",
      barrier_to_entry: "Medium",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for Tavily search
    mockSearch.mockResolvedValue({
      results: [{ title: "Salary Data", content: "Average $50/hr" }],
      answer: "Mock search answer",
    });
  });

  describe("successful generation", () => {
    it("should return valid market research data", async () => {
      vi.mocked(ai.generate).mockResolvedValue({
        text: JSON.stringify(validMarketResearchOutput),
      } as never);

      const result = await analyzeMarketFlow({
        role: "Frontend Developer",
        region: "Argentina",
      });

      expect(result).toEqual(validMarketResearchOutput);
    });

    it("should call Tavily search with cascade query", async () => {
      vi.mocked(ai.generate).mockResolvedValue({
        text: JSON.stringify(validMarketResearchOutput),
      } as never);

      await analyzeMarketFlow({
        role: "Backend Engineer",
        region: "Brazil",
      });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.stringContaining("Backend Engineer"),
        expect.objectContaining({
          searchDepth: "advanced",
          maxResults: 7,
          includeAnswer: true,
        }),
      );
    });

    it("should include region in search query", async () => {
      vi.mocked(ai.generate).mockResolvedValue({
        text: JSON.stringify(validMarketResearchOutput),
      } as never);

      await analyzeMarketFlow({
        role: "DevOps Engineer",
        region: "Mexico",
      });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.stringContaining("Mexico"),
        expect.any(Object),
      );
    });

    it("should pass search context to AI prompt", async () => {
      vi.mocked(ai.generate).mockResolvedValue({
        text: JSON.stringify(validMarketResearchOutput),
      } as never);

      await analyzeMarketFlow({
        role: "Data Scientist",
        region: "LATAM",
      });

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("Mock search answer"),
        }),
      );
    });

    it("should parse response wrapped in markdown code blocks", async () => {
      vi.mocked(ai.generate).mockResolvedValue({
        text: "```json\n" + JSON.stringify(validMarketResearchOutput) + "\n```",
      } as never);

      const result = await analyzeMarketFlow({
        role: "Cloud Architect",
        region: "Chile",
      });

      expect(result).toEqual(validMarketResearchOutput);
    });
  });

  describe("error handling", () => {
    it("should continue with fallback message if Tavily fails", async () => {
      mockSearch.mockRejectedValue(new Error("API unavailable"));
      vi.mocked(ai.generate).mockResolvedValue({
        text: JSON.stringify(validMarketResearchOutput),
      } as never);

      const result = await analyzeMarketFlow({
        role: "ML Engineer",
        region: "Canada",
      });

      expect(result).toEqual(validMarketResearchOutput);
      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("Search unavailable"),
        }),
      );
    });

    it("should throw error when AI returns invalid JSON", async () => {
      vi.mocked(ai.generate).mockResolvedValue({
        text: "not valid json",
      } as never);

      await expect(
        analyzeMarketFlow({
          role: "Frontend Developer",
          region: "Argentina",
        }),
      ).rejects.toThrow("Failed to generate market analysis");
    });

    it("should throw error when response fails schema validation", async () => {
      vi.mocked(ai.generate).mockResolvedValue({
        text: JSON.stringify({ invalid: "data" }),
      } as never);

      await expect(
        analyzeMarketFlow({
          role: "Backend Developer",
          region: "Brazil",
        }),
      ).rejects.toThrow("Failed to generate market analysis");
    });

    it("should propagate AI generation errors", async () => {
      vi.mocked(ai.generate).mockRejectedValue(
        new Error("AI service unavailable"),
      );

      await expect(
        analyzeMarketFlow({
          role: "Full Stack Developer",
          region: "Remote",
        }),
      ).rejects.toThrow("AI service unavailable");
    });
  });

  describe("prompt content", () => {
    it("should include CASCADE priority protocol in prompt", async () => {
      vi.mocked(ai.generate).mockResolvedValue({
        text: JSON.stringify(validMarketResearchOutput),
      } as never);

      await analyzeMarketFlow({
        role: "Software Engineer",
        region: "Colombia",
      });

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("CASCADE"),
        }),
      );
    });

    it("should mention Tech Recruitment Analyst role", async () => {
      vi.mocked(ai.generate).mockResolvedValue({
        text: JSON.stringify(validMarketResearchOutput),
      } as never);

      await analyzeMarketFlow({
        role: "Cloud Architect",
        region: "Chile",
      });

      expect(ai.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("Tech Recruitment Analyst"),
        }),
      );
    });
  });
});
