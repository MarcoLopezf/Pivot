import { describe, it, expect } from "vitest";
import {
  MarketResearchSchema,
  DemandVerdictEnum,
  DemandTrendEnum,
  SkillCategoryEnum,
  BarrierToEntryEnum,
} from "@infrastructure/ai/schemas/marketSchema";

/**
 * Unit tests for MarketResearchSchema
 *
 * Tests Zod schema validation for Market Intelligence AI output.
 * Ensures proper validation of salary, demand, skills, and analysis data.
 */

describe("MarketResearchSchema", () => {
  // Valid complete data for reuse
  const validMarketResearch = {
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
      summary: "Strong demand for this role in the current market.",
      key_growth_factor: "AI integration driving demand",
      barrier_to_entry: "Medium",
    },
  };

  describe("valid data", () => {
    it("should parse valid complete market research data", () => {
      const result = MarketResearchSchema.safeParse(validMarketResearch);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.salary.currency).toBe("USD");
        expect(result.data.demand.score).toBe(85);
        expect(result.data.top_skills).toHaveLength(2);
        expect(result.data.analysis.barrier_to_entry).toBe("Medium");
      }
    });

    it("should parse data without optional annual salary", () => {
      const dataWithoutAnnual = {
        ...validMarketResearch,
        salary: {
          currency: "USD",
          hourly: { min: 25, median: 45, max: 75 },
        },
      };

      const result = MarketResearchSchema.safeParse(dataWithoutAnnual);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.salary.annual).toBeUndefined();
      }
    });

    it("should parse data with empty top_skills array", () => {
      const dataWithEmptySkills = {
        ...validMarketResearch,
        top_skills: [],
      };

      const result = MarketResearchSchema.safeParse(dataWithEmptySkills);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.top_skills).toHaveLength(0);
      }
    });
  });

  describe("salary validation", () => {
    it("should reject missing currency", () => {
      const invalidData = {
        ...validMarketResearch,
        salary: {
          hourly: { min: 25, median: 45, max: 75 },
        },
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject missing hourly range", () => {
      const invalidData = {
        ...validMarketResearch,
        salary: {
          currency: "USD",
        },
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject non-numeric salary values", () => {
      const invalidData = {
        ...validMarketResearch,
        salary: {
          currency: "USD",
          hourly: { min: "low", median: "mid", max: "high" },
        },
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("demand validation", () => {
    it("should reject score below 0", () => {
      const invalidData = {
        ...validMarketResearch,
        demand: {
          score: -10,
          verdict: "High",
          trend: "Growing",
        },
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject score above 100", () => {
      const invalidData = {
        ...validMarketResearch,
        demand: {
          score: 150,
          verdict: "High",
          trend: "Growing",
        },
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject invalid verdict enum value", () => {
      const invalidData = {
        ...validMarketResearch,
        demand: {
          score: 85,
          verdict: "SuperHigh",
          trend: "Growing",
        },
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject invalid trend enum value", () => {
      const invalidData = {
        ...validMarketResearch,
        demand: {
          score: 85,
          verdict: "High",
          trend: "Skyrocketing",
        },
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("top_skills validation", () => {
    it("should reject more than 8 skills", () => {
      const nineSkills = Array.from({ length: 9 }, (_, i) => ({
        name: `Skill${i}`,
        category: "Language",
        relevance: 80,
      }));

      const invalidData = {
        ...validMarketResearch,
        top_skills: nineSkills,
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should accept exactly 8 skills", () => {
      const eightSkills = Array.from({ length: 8 }, (_, i) => ({
        name: `Skill${i}`,
        category: "Language",
        relevance: 80,
      }));

      const validData = {
        ...validMarketResearch,
        top_skills: eightSkills,
      };

      const result = MarketResearchSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should reject invalid skill category", () => {
      const invalidData = {
        ...validMarketResearch,
        top_skills: [
          { name: "TypeScript", category: "InvalidCategory", relevance: 95 },
        ],
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject skill relevance below 0", () => {
      const invalidData = {
        ...validMarketResearch,
        top_skills: [
          { name: "TypeScript", category: "Language", relevance: -5 },
        ],
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject skill relevance above 100", () => {
      const invalidData = {
        ...validMarketResearch,
        top_skills: [
          { name: "TypeScript", category: "Language", relevance: 105 },
        ],
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("analysis validation", () => {
    it("should reject invalid barrier_to_entry enum", () => {
      const invalidData = {
        ...validMarketResearch,
        analysis: {
          summary: "Summary text",
          key_growth_factor: "Growth factor",
          barrier_to_entry: "VeryHigh",
        },
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject missing summary", () => {
      const invalidData = {
        ...validMarketResearch,
        analysis: {
          key_growth_factor: "Growth factor",
          barrier_to_entry: "Medium",
        },
      };

      const result = MarketResearchSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("enum exports", () => {
    it("should export valid DemandVerdictEnum values", () => {
      expect(DemandVerdictEnum.options).toEqual([
        "Low",
        "Moderate",
        "High",
        "Very High",
      ]);
    });

    it("should export valid DemandTrendEnum values", () => {
      expect(DemandTrendEnum.options).toEqual([
        "Declining",
        "Stable",
        "Growing",
        "Exploding",
      ]);
    });

    it("should export valid SkillCategoryEnum values", () => {
      expect(SkillCategoryEnum.options).toEqual([
        "Language",
        "Framework",
        "Database",
        "Cloud",
        "Tooling",
        "Concept",
      ]);
    });

    it("should export valid BarrierToEntryEnum values", () => {
      expect(BarrierToEntryEnum.options).toEqual(["Low", "Medium", "High"]);
    });
  });
});
