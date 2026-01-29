import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { createLogger } from "@infrastructure/logging/logger";

const logger = createLogger("GET /api/learning/roadmap");

/**
 * API Response Format
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
 * Zod schema for query parameters validation
 */
const QueryParamsSchema = z.object({
  userId: z.string().min(1, "userId cannot be empty"),
});

/**
 * GET /api/learning/roadmap - Retrieve user's latest roadmap
 *
 * Query parameters:
 * - userId (required): User identifier
 *
 * Responses:
 * - 200: Roadmap found, returns RoadmapDTO
 * - 400: Missing or invalid userId
 * - 404: No roadmap found for user (valid state, not an error)
 * - 500: Internal server error
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiSuccessResponse<RoadmapDTO> | ApiErrorResponse>> {
  try {
    // Parse and validate query parameters with Zod
    const queryParams = Object.fromEntries(request.nextUrl.searchParams);
    const parseResult = QueryParamsSchema.safeParse(queryParams);

    if (!parseResult.success) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { userId } = parseResult.data;

    // Get use case from DI container
    const getUserRoadmap = learningContainer.getGetUserRoadmapUseCase();

    // Execute use case
    const roadmapDTO = await getUserRoadmap.execute(userId);

    // Handle case where user has not generated a roadmap yet
    if (!roadmapDTO) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "ROADMAP_NOT_FOUND",
          message: "No roadmap found for this user. Please generate one first.",
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Return success response
    const response: ApiSuccessResponse<RoadmapDTO> = {
      success: true,
      data: roadmapDTO,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle validation errors from domain entities
    if (
      error instanceof Error &&
      (error.message.includes("cannot be empty") ||
        error.message.includes("Invalid"))
    ) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Handle unexpected errors
    logger.error("Unexpected error while fetching roadmap", error, {
      searchParams: Object.fromEntries(request.nextUrl.searchParams),
    });
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
