import { prisma } from "../database/PrismaClient";
import { analyzeMarketFlow } from "../ai/flows/analyzeMarketFlow";
// Note: Using string literal for SourceType to match Prisma enum
import type { MarketResearch } from "../ai/schemas/marketSchema";

/**
 * MarketResearchService
 *
 * Manages the logic between Database caching and AI generation
 * for Market Intelligence data. Implements 30-day cache rule.
 */
export class MarketResearchService {
  private readonly CACHE_DAYS = 30;

  /**
   * Get market analysis for a job role and region.
   * Returns cached data if valid, otherwise generates new data via AI.
   *
   * @param roleSlug - The slug of the job role (e.g., 'senior-frontend-developer')
   * @param region - The region for analysis (default: 'GLOBAL')
   * @returns MarketResearch data
   */
  async getMarketAnalysis(
    roleSlug: string,
    region: string = "GLOBAL",
  ): Promise<MarketResearch> {
    // Step 1: Validate role exists in catalog
    const jobRole = await prisma.jobRole.findUnique({
      where: { slug: roleSlug },
    });

    if (!jobRole) {
      throw new Error(`Role '${roleSlug}' not found in catalog.`);
    }

    // Step 2: Check cache (30-day rule)
    const cachedReport = await prisma.marketReport.findFirst({
      where: {
        roleId: jobRole.id,
        region: region,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (cachedReport) {
      return cachedReport.data as MarketResearch;
    }

    // Step 3: Cache miss - Generate new data via AI
    const marketResearch = await analyzeMarketFlow({
      role: jobRole.displayName,
      region: region,
    });

    // Step 4: Save to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.CACHE_DAYS);

    await prisma.marketReport.create({
      data: {
        roleId: jobRole.id,
        region: region,
        data: marketResearch,
        sourceType: "GENKIT_AUTO",
        expiresAt: expiresAt,
      },
    });

    // Step 5: Return newly generated data
    return marketResearch;
  }
}
