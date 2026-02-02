import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assessmentContainer } from "@infrastructure/di/AssessmentContainer";
import { ProjectResultDTO } from "@application/dtos/assessment/SubmitProjectDTO";
import { createLogger } from "@infrastructure/logging/logger";

const logger = createLogger(
  "POST /api/learning/roadmap/items/[itemId]/project",
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

const SubmitProjectBodySchema = z.object({
  roadmapId: z.string().min(1, "roadmapId is required"),
  repoUrl: z.string().url("repoUrl must be a valid URL"),
});

/**
 * POST /api/learning/roadmap/items/[itemId]/project
 *
 * Submits a GitHub repository URL for project validation.
 * Only works for PROJECT-type roadmap items.
 *
 * Flow:
 * 1. Validates that the roadmap item is of type PROJECT
 * 2. Fetches repository code from GitHub
 * 3. Analyzes code quality using AI
 * 4. If passed (≥70%), marks roadmap item as completed
 *
 * Route parameters:
 * - itemId (required): ID of the roadmap item
 *
 * Body:
 * - roadmapId (required): ID of the roadmap containing the item
 * - repoUrl (required): GitHub repository URL (https://github.com/user/repo)
 *
 * Responses:
 * - 200: Project analyzed successfully
 * - 400: Validation error (invalid URL, not a PROJECT item, etc.)
 * - 404: Roadmap or item not found
 * - 500: Internal server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
): Promise<
  NextResponse<ApiSuccessResponse<ProjectResultDTO> | ApiErrorResponse>
> {
  try {
    // Await params (Next.js 15 requirement)
    const { itemId } = await params;

    // Parse and validate request body
    const body: unknown = await request.json();
    const parseResult = SubmitProjectBodySchema.safeParse(body);

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

    const { roadmapId, repoUrl } = parseResult.data;

    // Get use case from DI container
    const submitProject = assessmentContainer.getSubmitProjectUseCase();

    // Execute use case
    const result = await submitProject.execute({
      roadmapId,
      roadmapItemId: itemId,
      repoUrl,
    });

    // Return success response
    const response: ApiSuccessResponse<ProjectResultDTO> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle known errors
    if (error instanceof Error) {
      // Invalid GitHub URL or SSRF protection
      if (error.message.includes("Invalid GitHub repository URL")) {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: "INVALID_URL",
            message: error.message,
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Not a PROJECT type item
      if (error.message.includes("not a PROJECT")) {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: "INVALID_ITEM_TYPE",
            message: error.message,
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Roadmap or item not found
      if (
        error.message.includes("not found") ||
        error.message.includes("Roadmap")
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

      // GitHub API errors
      if (
        error.message.includes("Repository not found") ||
        error.message.includes("private")
      ) {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: "GITHUB_ERROR",
            message: error.message,
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Rate limiting
      if (error.message.includes("rate limit")) {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: error.message,
          },
        };
        return NextResponse.json(response, { status: 429 });
      }

      // Generic validation errors
      if (
        error.message.includes("cannot be empty") ||
        error.message.includes("Invalid")
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
    }

    // Handle unexpected errors
    logger.error("Unexpected error while submitting project", error, {
      itemId: (await params).itemId,
    });

    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while analyzing the project",
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
