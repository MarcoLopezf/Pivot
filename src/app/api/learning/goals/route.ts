import { NextRequest, NextResponse } from "next/server";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { CareerGoalDTO } from "@application/dtos/learning/CareerGoalDTO";

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
 * Request body structure
 */
interface CreateGoalRequest {
  userId: string;
  targetRole: string;
  currentRole: string;
}

/**
 * POST /api/learning/goals - Create a new career goal
 *
 * Request body:
 * {
 *   "userId": string,
 *   "targetRole": string,
 *   "currentRole": string
 * }
 *
 * Responses:
 * - 201: Career goal created successfully
 * - 400: Invalid request body or validation error
 * - 500: Internal server error
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiSuccessResponse<CareerGoalDTO> | ApiErrorResponse>> {
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

    // Get use case from DI container
    const setCareerGoal = learningContainer.getSetCareerGoalUseCase();

    // Execute use case
    const careerGoalDTO: CareerGoalDTO = await setCareerGoal.execute({
      userId: body.userId,
      targetRole: body.targetRole,
      currentRole: body.currentRole,
    });

    // Return success response
    const response: ApiSuccessResponse<CareerGoalDTO> = {
      success: true,
      data: careerGoalDTO,
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
