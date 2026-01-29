import { NextRequest, NextResponse } from "next/server";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { CareerGoalDTO } from "@application/dtos/learning/CareerGoalDTO";
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
 * Success response with both goal and roadmap
 */
interface GoalWithRoadmapResponse {
  goal: CareerGoalDTO;
  roadmap: RoadmapDTO;
}

/**
 * Request body structure
 */
interface CreateGoalRequest {
  userId: string;
  targetRole: string;
  currentRole: string;
}

/**
 * POST /api/learning/goals - Create a new career goal and generate roadmap
 *
 * Request body:
 * {
 *   "userId": string,
 *   "targetRole": string,
 *   "currentRole": string
 * }
 *
 * This endpoint:
 * 1. Creates the career goal
 * 2. Automatically generates a personalized learning roadmap with AI
 *
 * Responses:
 * - 201: Career goal and roadmap created successfully
 * - 400: Invalid request body or validation error
 * - 500: Internal server error (goal may be saved even if roadmap generation fails)
 */
export async function POST(
  request: NextRequest,
): Promise<
  NextResponse<ApiSuccessResponse<GoalWithRoadmapResponse> | ApiErrorResponse>
> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate request body structure
    if (!isValidCreateGoalRequest(body)) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_REQUEST_BODY",
          message:
            "Request body must include 'userId', 'targetRole', and 'currentRole' fields",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get use cases from DI container
    const setCareerGoal = learningContainer.getSetCareerGoalUseCase();
    const generateUserRoadmap =
      learningContainer.getGenerateUserRoadmapUseCase();

    // Step 1: Create the career goal
    const careerGoalDTO: CareerGoalDTO = await setCareerGoal.execute({
      userId: body.userId,
      targetRole: body.targetRole,
      currentRole: body.currentRole,
    });

    // Step 2: Automatically generate roadmap with AI
    let roadmapDTO: RoadmapDTO;
    try {
      roadmapDTO = await generateUserRoadmap.execute({
        goalId: careerGoalDTO.id,
        currentRole: body.currentRole,
        targetRole: body.targetRole,
      });
    } catch (roadmapError) {
      // Graceful degradation: Goal is saved, but roadmap generation failed
      console.error(
        "Failed to generate roadmap after creating goal:",
        roadmapError,
      );
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "ROADMAP_GENERATION_FAILED",
          message:
            "Career goal saved, but roadmap generation failed. Please try regenerating later.",
        },
      };
      // Return 500 but goal is already saved in DB
      return NextResponse.json(response, { status: 500 });
    }

    // Return success response with both goal and roadmap
    const response: ApiSuccessResponse<GoalWithRoadmapResponse> = {
      success: true,
      data: {
        goal: careerGoalDTO,
        roadmap: roadmapDTO,
      },
    };

    return NextResponse.json(response, { status: 201 });
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
    console.error("Unexpected error in POST /api/learning/goals:", error);
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

/**
 * Type guard to validate CreateGoalRequest structure
 */
function isValidCreateGoalRequest(body: unknown): body is CreateGoalRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    "userId" in body &&
    typeof (body as Record<string, unknown>).userId === "string" &&
    "targetRole" in body &&
    typeof (body as Record<string, unknown>).targetRole === "string" &&
    "currentRole" in body &&
    typeof (body as Record<string, unknown>).currentRole === "string"
  );
}
