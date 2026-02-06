import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { LearningResource } from "@domain/learning/repositories/IResourceRepository";
import { createLogger } from "@infrastructure/logging/logger";

const logger = createLogger(
  "GET /api/learning/roadmap/items/[itemId]/resources",
);

/**
 * API Response Types
 */
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Query Parameters Schema
 */
const QueryParamsSchema = z.object({
  topic: z.string().min(1, "topic is required"),
  difficulty: z.string().optional(),
});

/**
 * GET /api/learning/roadmap/items/[itemId]/resources
 *
 * Retrieves learning resources (videos) for a roadmap item using lazy loading:
 * 1. Try database first (cache hit)
 * 2. Fall back to YouTube API if DB empty (cache miss)
 * 3. Save API results to DB for future requests
 *
 * Query parameters:
 * - topic (required): The topic to search for (e.g., "React Hooks", "TypeScript Generics")
 * - difficulty (optional): Learning level ('beginner', 'intermediate', 'advanced') for contextualized search
 *
 * Route parameters:
 * - itemId (required): ID of the roadmap item
 *
 * Responses:
 * - 200: Resources retrieved successfully
 * - 400: Invalid parameters
 * - 500: Internal server error
 *
 * Examples:
 * GET /api/learning/roadmap/items/abc123/resources?topic=React%20Hooks&difficulty=beginner
 * GET /api/learning/roadmap/items/abc123/resources?topic=Variables&difficulty=advanced
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
): Promise<
  NextResponse<ApiSuccessResponse<LearningResource[]> | ApiErrorResponse>
> {
  try {
    // Await params (Next.js 15 requirement)
    const { itemId } = await params;

    // Validate query parameters
    const queryParams = Object.fromEntries(request.nextUrl.searchParams);
    const parseResult = QueryParamsSchema.safeParse(queryParams);

    if (!parseResult.success) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", "),
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { topic, difficulty } = parseResult.data;

    logger.info(
      `Fetching resources for item ${itemId}, topic: ${topic}, difficulty: ${difficulty || "default"}`,
    );

    // Get use case from DI container
    const getItemResources = learningContainer.getGetItemResourcesUseCase();

    // Execute use case (lazy loading: DB -> API -> Save)
    const resources = await getItemResources.execute(itemId, topic, difficulty);

    logger.info(`Found ${resources.length} resources for item ${itemId}`);

    // Return success response
    const response: ApiSuccessResponse<LearningResource[]> = {
      success: true,
      data: resources,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error("Error fetching resources:", error);

    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch learning resources",
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
