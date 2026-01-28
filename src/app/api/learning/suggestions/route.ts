import { NextRequest, NextResponse } from "next/server";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { RoleSuggestionDTO } from "@application/use-cases/learning/SuggestCareerRoles";

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
interface SuggestRolesRequest {
  currentRole: string;
  skills: string[];
}

/**
 * POST /api/learning/suggestions - Get AI-powered career role suggestions
 *
 * Request body:
 * {
 *   "currentRole": string,
 *   "skills": string[]
 * }
 *
 * Responses:
 * - 200: Suggestions generated successfully
 * - 400: Invalid request body or validation error
 * - 500: Internal server error (AI generation failed)
 */
export async function POST(
  request: NextRequest,
): Promise<
  NextResponse<ApiSuccessResponse<RoleSuggestionDTO[]> | ApiErrorResponse>
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
    if (!isValidSuggestRolesRequest(body)) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_REQUEST_BODY",
          message:
            "Request body must include 'currentRole' (string) and 'skills' (array of strings)",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate that currentRole and skills are not empty
    if (body.currentRole.trim().length === 0) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Current role cannot be empty",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (body.skills.length === 0) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Skills array must contain at least one skill",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get use case from DI container
    const suggestCareerRoles = learningContainer.getSuggestCareerRolesUseCase();

    // Execute use case (calls AI)
    const suggestions: RoleSuggestionDTO[] = await suggestCareerRoles.execute({
      currentRole: body.currentRole,
      skills: body.skills,
    });

    // Return success response
    const response: ApiSuccessResponse<RoleSuggestionDTO[]> = {
      success: true,
      data: suggestions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle AI generation errors
    if (
      error instanceof Error &&
      error.message.includes("Failed to generate role recommendations")
    ) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "AI_GENERATION_FAILED",
          message:
            "Failed to generate role suggestions. Please try again later.",
        },
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Handle unexpected errors
    console.error("Unexpected error in POST /api/learning/suggestions:", error);
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
 * Type guard to validate SuggestRolesRequest structure
 */
function isValidSuggestRolesRequest(
  body: unknown,
): body is SuggestRolesRequest {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const obj = body as Record<string, unknown>;

  // Check currentRole
  if (!("currentRole" in obj) || typeof obj.currentRole !== "string") {
    return false;
  }

  // Check skills
  if (!("skills" in obj) || !Array.isArray(obj.skills)) {
    return false;
  }

  // Validate all items in skills array are strings
  return obj.skills.every((skill) => typeof skill === "string");
}
