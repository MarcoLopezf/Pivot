import { NextRequest, NextResponse } from "next/server";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";

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
    // Extract userId from query params
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId || userId.trim().length === 0) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "MISSING_USER_ID",
          message: "Query parameter 'userId' is required",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

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
    console.error("Unexpected error in GET /api/learning/roadmap:", error);
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
