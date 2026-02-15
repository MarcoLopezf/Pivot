import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { LearningResource } from "@domain/learning/repositories/IResourceRepository";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";
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
  tags: z.array(z.string().min(1)).min(1, "At least one tag is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
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
 * - tags (required): Tags to search for (e.g., tags=react&tags=hooks)
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
 * GET /api/learning/roadmap/items/abc123/resources?tags=react&tags=hooks&difficulty=beginner
 * GET /api/learning/roadmap/items/abc123/resources?tags=typescript&difficulty=advanced
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

    // Validate query parameters (use getAll for array support)
    const queryParams = {
      tags: request.nextUrl.searchParams.getAll("tags"),
      difficulty: request.nextUrl.searchParams.get("difficulty") || undefined,
    };
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

    const { tags, difficulty } = parseResult.data;

    logger.info(
      `Fetching resources for item ${itemId}, tags: [${tags.join(", ")}], difficulty: ${difficulty || "default"}`,
    );

    // Get use case from DI container
    const getItemResources = learningContainer.getGetItemResourcesUseCase();

    // Execute use case (lazy loading: DB -> API -> Save)
    const resources = await getItemResources.execute(
      itemId,
      tags,
      difficulty as DifficultyLevel | undefined,
    );

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
