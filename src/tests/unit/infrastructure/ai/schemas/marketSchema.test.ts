import { describe, it, expect } from "vitest";
import {
  MarketResearchSchema,
  SalaryRangeSchema,
  CareerLadderSchema,
  DemandSchema,
  TopSkillSchema,
  AnalysisSchema,
} from "@/infrastructure/ai/schemas/marketSchema";

describe("MarketResearch Schema", () => {
  describe("SalaryRangeSchema", () => {
    it("should validate a valid salary range", () => {
      const validRange = {
        min: 25,
        max: 75,
        median: 45,
        currency: "USD",
      };

      const result = SalaryRangeSchema.safeParse(validRange);
      expect(result.success).toBe(true);
    });

    it("should reject non-integer values", () => {
      const invalidRange = {
        min: 25.5,
        max: 75,
        median: 45,
        currency: "USD",
      };

      const result = SalaryRangeSchema.safeParse(invalidRange);
      expect(result.success).toBe(false);
    });
  });

  describe("CareerLadderSchema", () => {
    it("should validate a complete career ladder", () => {
      const validLadder = {
        junior: { min: 25, max: 40, median: 32, currency: "USD" },
        mid: { min: 45, max: 70, median: 55, currency: "USD" },
        senior: { min: 75, max: 120, median: 95, currency: "USD" },
      };

      const result = CareerLadderSchema.safeParse(validLadder);
      expect(result.success).toBe(true);
    });

    it("should reject missing levels", () => {
      const incompleteLadder = {
        junior: { min: 25, max: 40, median: 32, currency: "USD" },
        // missing mid and senior
      };

      const result = CareerLadderSchema.safeParse(incompleteLadder);
      expect(result.success).toBe(false);
    });
  });

  describe("DemandSchema", () => {
    it("should validate demand with score in range", () => {
      const validDemand = {
        verdict: "High",
        score: 85,
        trend: "Growing",
      };

      const result = DemandSchema.safeParse(validDemand);
      expect(result.success).toBe(true);
    });

    it("should reject score above 100", () => {
      const invalidDemand = {
        verdict: "High",
        score: 150,
        trend: "Growing",
      };

      const result = DemandSchema.safeParse(invalidDemand);
      expect(result.success).toBe(false);
    });

    it("should reject score below 0", () => {
      const invalidDemand = {
        verdict: "Low",
        score: -10,
        trend: "Declining",
      };

      const result = DemandSchema.safeParse(invalidDemand);
      expect(result.success).toBe(false);
    });
  });

  describe("TopSkillSchema", () => {
    it("should validate a skill with name and relevance", () => {
      const validSkill = {
        name: "React",
        relevance: 95,
      };

      const result = TopSkillSchema.safeParse(validSkill);
      expect(result.success).toBe(true);
    });

    it("should reject relevance above 100", () => {
      const invalidSkill = {
        name: "React",
        relevance: 150,
      };

      const result = TopSkillSchema.safeParse(invalidSkill);
      expect(result.success).toBe(false);
    });
  });

  describe("AnalysisSchema", () => {
    it("should validate analysis with summary and key growth factor", () => {
      const validAnalysis = {
        summary: "Market is growing rapidly.",
        key_growth_factor: "AI adoption",
      };

      const result = AnalysisSchema.safeParse(validAnalysis);
      expect(result.success).toBe(true);
    });
  });

  describe("MarketResearchSchema (full)", () => {
    it("should validate a complete market research object", () => {
      const validResearch = {
        role: "Rust Developer",
        region: "Argentina",
        salary_ladder: {
          junior: { min: 25, max: 40, median: 32, currency: "USD" },
          mid: { min: 45, max: 70, median: 55, currency: "USD" },
          senior: { min: 75, max: 120, median: 95, currency: "USD" },
        },
        demand: {
          verdict: "High",
          score: 85,
          trend: "Growing",
        },
        top_skills: [
          { name: "Rust", relevance: 95 },
          { name: "WebAssembly", relevance: 80 },
        ],
        analysis: {
          summary: "Rust developers are in high demand.",
          key_growth_factor: "Memory safety focus",
        },
      };

      const result = MarketResearchSchema.safeParse(validResearch);
      expect(result.success).toBe(true);
    });

    it("should reject missing required fields", () => {
      const incompleteResearch = {
        role: "Developer",
        // missing other required fields
      };

      const result = MarketResearchSchema.safeParse(incompleteResearch);
      expect(result.success).toBe(false);
    });
  });
});
