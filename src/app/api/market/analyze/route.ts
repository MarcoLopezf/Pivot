import { NextResponse } from "next/server";
import { MarketResearchService } from "../../../../infrastructure/services/MarketResearchService";
import { z } from "zod";

/**
 * Request body validation schema
 */
const bodySchema = z.object({
  slug: z.string(),
  region: z.string().default("GLOBAL"),
});

/**
 * POST /api/market/analyze
 *
 * Analyzes job market data for a specific role and region.
 * Returns cached data if available, otherwise generates via AI.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { slug, region } = bodySchema.parse(body);

    // Execute market analysis
    const service = new MarketResearchService();
    const data = await service.getMarketAnalysis(slug, region);

    return NextResponse.json(data);
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    // Handle Zod validation errors (Zod 4.x uses 'issues' property)
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: (error as { issues: unknown[] }).issues,
        },
        { status: 400 },
      );
    }

    // Handle known errors
    if (error instanceof Error) {
      // Role not found - 404
      if (error.message.includes("not found in catalog")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      // Other errors - 500
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Unknown error
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
