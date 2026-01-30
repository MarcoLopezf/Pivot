import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assessmentContainer } from "@infrastructure/di/AssessmentContainer";
import { QuizDTO } from "@application/dtos/assessment/QuizDTO";
import { createLogger } from "@infrastructure/logging/logger";

const logger = createLogger("GET /api/learning/roadmap/items/[itemId]/quiz");

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

const QueryParamsSchema = z.object({
  roadmapId: z.string().min(1, "roadmapId is required"),
});

/**
 * GET /api/learning/roadmap/items/[itemId]/quiz
 *
 * Generates a quiz for a THEORY roadmap item.
 * Uses smart pool strategy: searches existing questions, generates new ones if needed.
 *
 * Query parameters:
 * - roadmapId (required): ID of the roadmap containing the item
 *
 * Route parameters:
 * - itemId (required): ID of the roadmap item
 *
 * Responses:
 * - 200: Quiz generated successfully
 * - 400: Invalid parameters or item is not THEORY type
 * - 404: Roadmap or item not found
 * - 500: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
): Promise<NextResponse<ApiSuccessResponse<QuizDTO> | ApiErrorResponse>> {
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

    const { roadmapId } = parseResult.data;

    // Get use case from DI container
    const generateQuiz = assessmentContainer.getGenerateQuizUseCase();

    // Execute use case
    const quizDTO = await generateQuiz.execute(roadmapId, itemId);

    // Return success response
    const response: ApiSuccessResponse<QuizDTO> = {
      success: true,
      data: quizDTO,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle known errors
    if (error instanceof Error) {
      // Validation errors
      if (
        error.message.includes("cannot be empty") ||
        error.message.includes("Invalid") ||
        error.message.includes("not found")
      ) {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: error.message.includes("not found")
              ? "NOT_FOUND"
              : "VALIDATION_ERROR",
            message: error.message,
          },
        };
        return NextResponse.json(response, {
          status: error.message.includes("not found") ? 404 : 400,
        });
      }

      // Cannot generate quiz for PROJECT items
      if (error.message.includes("Cannot generate quiz for PROJECT")) {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: "INVALID_ITEM_TYPE",
            message: error.message,
          },
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Handle unexpected errors
    logger.error("Unexpected error while generating quiz", error, {
      itemId: (await params).itemId,
      searchParams: Object.fromEntries(request.nextUrl.searchParams),
    });

    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while generating the quiz",
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
