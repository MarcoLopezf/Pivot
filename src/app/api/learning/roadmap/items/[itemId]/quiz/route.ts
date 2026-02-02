import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assessmentContainer } from "@infrastructure/di/AssessmentContainer";
import { QuizDTO } from "@application/dtos/assessment/QuizDTO";
import { QuizResultDTO } from "@application/dtos/assessment/SubmitQuizDTO";
import { createLogger } from "@infrastructure/logging/logger";

const logger = createLogger("GET /api/learning/roadmap/items/[itemId]/quiz");
const postLogger = createLogger(
  "POST /api/learning/roadmap/items/[itemId]/quiz",
);

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

const SubmitQuizBodySchema = z.object({
  roadmapId: z.string().min(1, "roadmapId is required"),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, "questionId is required"),
        selectedOptionId: z.string().min(1, "selectedOptionId is required"),
      }),
    )
    .min(1, "At least one answer is required"),
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

/**
 * POST /api/learning/roadmap/items/[itemId]/quiz
 *
 * Submits quiz answers for grading.
 * If the user passes (≥70%), the roadmap item is marked as completed.
 *
 * Route parameters:
 * - itemId (required): ID of the roadmap item
 *
 * Body:
 * - userId (required): ID of the user submitting the quiz
 * - roadmapId (required): ID of the roadmap containing the item
 * - answers (required): Array of { questionId, selectedOptionId }
 *
 * Responses:
 * - 200: Quiz graded successfully
 * - 400: Validation error
 * - 404: Questions not found
 * - 500: Internal server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
): Promise<NextResponse<ApiSuccessResponse<QuizResultDTO> | ApiErrorResponse>> {
  try {
    // Await params (Next.js 15 requirement)
    const { itemId } = await params;

    // Parse and validate request body
    const body: unknown = await request.json();
    const parseResult = SubmitQuizBodySchema.safeParse(body);

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

    const { roadmapId, answers } = parseResult.data;

    // Get use case from DI container
    const submitQuiz = assessmentContainer.getSubmitQuizUseCase();

    // Execute use case
    const result = await submitQuiz.execute({
      roadmapId,
      roadmapItemId: itemId,
      answers,
    });

    // Return success response
    const response: ApiSuccessResponse<QuizResultDTO> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle known errors
    if (error instanceof Error) {
      // Validation errors from use case
      if (error.message.startsWith("VALIDATION_ERROR:")) {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message.replace("VALIDATION_ERROR: ", ""),
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Not found errors
      if (
        error.message.includes("not found") ||
        error.message.includes("Invalid")
      ) {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        };
        return NextResponse.json(response, { status: 404 });
      }
    }

    // Handle unexpected errors
    postLogger.error("Unexpected error while submitting quiz", error, {
      itemId: (await params).itemId,
    });

    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while grading the quiz",
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
