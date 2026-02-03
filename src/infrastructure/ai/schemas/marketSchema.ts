import { z } from "zod";

// ============================================================================
// Enums
// ============================================================================

const DemandVerdictEnum = z.enum(["Low", "Moderate", "High", "Very High"]);

const DemandTrendEnum = z.enum(["Declining", "Stable", "Growing", "Exploding"]);

const SkillCategoryEnum = z.enum([
  "Language",
  "Framework",
  "Database",
  "Cloud",
  "Tooling",
  "Concept",
]);

const BarrierToEntryEnum = z.enum(["Low", "Medium", "High"]);

// ============================================================================
// Sub-schemas
// ============================================================================

const SalaryRangeSchema = z.object({
  min: z.number(),
  median: z.number(),
  max: z.number(),
});

const SalarySchema = z.object({
  currency: z.string(),
  hourly: SalaryRangeSchema,
  annual: SalaryRangeSchema.optional(),
});

const DemandSchema = z.object({
  score: z.number().min(0).max(100),
  verdict: DemandVerdictEnum,
  trend: DemandTrendEnum,
});

const TopSkillSchema = z.object({
  name: z.string(),
  category: SkillCategoryEnum,
  relevance: z.number().min(0).max(100),
});

const AnalysisSchema = z.object({
  summary: z.string(),
  key_growth_factor: z.string(),
  barrier_to_entry: BarrierToEntryEnum,
});

// ============================================================================
// Main Schema
// ============================================================================

export const MarketResearchSchema = z.object({
  salary: SalarySchema,
  demand: DemandSchema,
  top_skills: z.array(TopSkillSchema).max(8),
  analysis: AnalysisSchema,
});

export type MarketResearch = z.infer<typeof MarketResearchSchema>;

// Export enums for reuse
export {
  DemandVerdictEnum,
  DemandTrendEnum,
  SkillCategoryEnum,
  BarrierToEntryEnum,
};
