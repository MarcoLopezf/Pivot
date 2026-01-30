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
 * POST /api/learning/goals - Create a new career goal and generate personalized roadmap
 *
 * Request body (multipart/form-data):
 * - userId: string (required)
 * - targetRole: string (required)
 * - currentRole: string (required)
 * - experienceSummary: string (optional) - Manual experience description
 * - cvFile: File (optional) - PDF CV file for text extraction
 *
 * This endpoint:
 * 1. Creates the career goal
 * 2. Automatically generates a personalized learning roadmap with AI
 * 3. Uses user context (experience + CV) for intelligent status assignment
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
    // Parse FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_FORM_DATA",
          message: "Request body must be valid multipart/form-data",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Extract and validate required fields
    const userId = formData.get("userId");
    const targetRole = formData.get("targetRole");
    const currentRole = formData.get("currentRole");

    if (
      !userId ||
      !targetRole ||
      !currentRole ||
      typeof userId !== "string" ||
      typeof targetRole !== "string" ||
      typeof currentRole !== "string"
    ) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_REQUEST_BODY",
          message:
            "Request must include 'userId', 'targetRole', and 'currentRole' fields",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Extract optional fields
    const experienceSummary = formData.get("experienceSummary");
    const cvFile = formData.get("cvFile");

    // Validate types
    const experienceSummaryStr =
      experienceSummary && typeof experienceSummary === "string"
        ? experienceSummary.trim()
        : undefined;

    // Convert File to Buffer if present
    let cvBuffer: Buffer | undefined;
    if (cvFile instanceof File) {
      if (cvFile.type !== "application/pdf") {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "CV file must be a PDF",
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      const arrayBuffer = await cvFile.arrayBuffer();
      cvBuffer = Buffer.from(arrayBuffer);
    }

    // Get use cases from DI container
    const setCareerGoal = learningContainer.getSetCareerGoalUseCase();
    const generateUserRoadmap =
      learningContainer.getGenerateUserRoadmapUseCase();

    // Step 1: Create the career goal
    const careerGoalDTO: CareerGoalDTO = await setCareerGoal.execute({
      userId,
      targetRole,
      currentRole,
    });

    // Step 2: Automatically generate personalized roadmap with AI
    let roadmapDTO: RoadmapDTO;
    try {
      roadmapDTO = await generateUserRoadmap.execute({
        goalId: careerGoalDTO.id,
        currentRole,
        targetRole,
        experienceSummary: experienceSummaryStr,
        cvFile: cvBuffer,
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
