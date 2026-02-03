import { z } from "zod";

// 1. Reusable Range Schema
export const SalaryRangeSchema = z.object({
  min: z.number().int().describe("Minimum hourly rate"),
  max: z.number().int().describe("Maximum hourly rate"),
  median: z.number().int().describe("Median hourly rate"),
  currency: z.string().describe("Currency code, e.g., USD"),
});

// 2. The Career Ladder (The core of our strategy)
export const CareerLadderSchema = z.object({
  junior: SalaryRangeSchema.describe("Entry level (0-2 years)"),
  mid: SalaryRangeSchema.describe("Mid level (2-5 years)"),
  senior: SalaryRangeSchema.describe("Senior level (5+ years)"),
});

export const DemandSchema = z.object({
  verdict: z.string(), // e.g., "High Demand"
  score: z.number().min(0).max(100),
  trend: z.string(), // e.g., "Stable", "Growing"
});

export const TopSkillSchema = z.object({
  name: z.string(),
  relevance: z.number().min(0).max(100),
});

export const AnalysisSchema = z.object({
  summary: z.string(),
  key_growth_factor: z.string(),
});

// 3. Main Schema
export const MarketResearchSchema = z.object({
  role: z.string(),
  region: z.string(),
  // Career Ladder replaces the old 'salary' field
  salary_ladder: CareerLadderSchema,
  demand: DemandSchema,
  top_skills: z.array(TopSkillSchema),
  analysis: AnalysisSchema,
});

// Type exports
export type SalaryRange = z.infer<typeof SalaryRangeSchema>;
export type CareerLadder = z.infer<typeof CareerLadderSchema>;
export type Demand = z.infer<typeof DemandSchema>;
export type TopSkill = z.infer<typeof TopSkillSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;
export type MarketResearch = z.infer<typeof MarketResearchSchema>;
