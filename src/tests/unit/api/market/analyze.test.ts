import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * Unit tests for POST /api/market/analyze
 *
 * Tests the API route for market analysis with mocked service layer.
 */

// Mock MarketResearchService with a proper class mock
const mockGetMarketAnalysis = vi.fn();

vi.mock("@infrastructure/services/MarketResearchService", () => {
  return {
    MarketResearchService: class MockMarketResearchService {
      getMarketAnalysis = mockGetMarketAnalysis;
    },
  };
});

// Import after mocks
import { POST } from "@/app/api/market/analyze/route";

describe("POST /api/market/analyze", () => {
  const mockMarketResearch = {
    salary: {
      currency: "USD",
      hourly: { min: 40, median: 65, max: 95 },
    },
    demand: {
      score: 85,
      verdict: "High",
      trend: "Growing",
    },
    top_skills: [{ name: "React", category: "Framework", relevance: 95 }],
    analysis: {
      summary: "Strong demand for this role.",
      key_growth_factor: "AI integration",
      barrier_to_entry: "Medium",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful requests", () => {
    it("should return market research data with status 200", async () => {
      mockGetMarketAnalysis.mockResolvedValue(mockMarketResearch);

      const request = new NextRequest(
        "http://localhost:3000/api/market/analyze",
        {
          method: "POST",
          body: JSON.stringify({
            slug: "frontend-developer",
            region: "GLOBAL",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMarketResearch);
    });

    it("should use GLOBAL as default region when not provided", async () => {
      mockGetMarketAnalysis.mockResolvedValue(mockMarketResearch);

      const request = new NextRequest(
        "http://localhost:3000/api/market/analyze",
        {
          method: "POST",
          body: JSON.stringify({ slug: "backend-developer" }),
          headers: { "Content-Type": "application/json" },
        },
      );

      await POST(request);

      expect(mockGetMarketAnalysis).toHaveBeenCalledWith(
        "backend-developer",
        "GLOBAL",
      );
    });

    it("should pass custom region to service", async () => {
      mockGetMarketAnalysis.mockResolvedValue(mockMarketResearch);

      const request = new NextRequest(
        "http://localhost:3000/api/market/analyze",
        {
          method: "POST",
          body: JSON.stringify({
            slug: "devops-engineer",
            region: "Argentina",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      await POST(request);

      expect(mockGetMarketAnalysis).toHaveBeenCalledWith(
        "devops-engineer",
        "Argentina",
      );
    });
  });

  describe("error handling", () => {
    it("should return 404 when role is not found", async () => {
      mockGetMarketAnalysis.mockRejectedValue(
        new Error("Role 'nonexistent-role' not found in catalog."),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/market/analyze",
        {
          method: "POST",
          body: JSON.stringify({ slug: "nonexistent-role" }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("not found");
    });

    it("should return 500 on internal server error", async () => {
      mockGetMarketAnalysis.mockRejectedValue(
        new Error("AI service unavailable"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/market/analyze",
        {
          method: "POST",
          body: JSON.stringify({ slug: "frontend-developer" }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "AI service unavailable");
    });

    it("should return 400 when slug is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/market/analyze",
        {
          method: "POST",
          body: JSON.stringify({ region: "GLOBAL" }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should return 400 on malformed JSON", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/market/analyze",
        {
          method: "POST",
          body: "not-valid-json",
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
