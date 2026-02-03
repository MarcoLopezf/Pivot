import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeMarketFlow } from "@/infrastructure/ai/flows/analyzeMarketFlow";

/**
 * Request body validation schema
 */
const bodySchema = z.object({
  slug: z.string(), // Actually the role name/display name
  region: z.string().default("GLOBAL"),
});

/**
 * POST /api/market/analyze
 *
 * Analyzes job market data for a specific role and region.
 * Calls the AI flow directly (bypasses DB cache for now).
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { slug: role, region } = bodySchema.parse(body);

    // Call the AI flow directly
    const data = await analyzeMarketFlow({ role, region });

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
      console.error("Market analysis error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Unknown error
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
