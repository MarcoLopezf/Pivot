import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dashboardContainer } from "@infrastructure/di/DashboardContainer";
import { DashboardDTO } from "@application/dtos/dashboard/DashboardDTO";
import { createLogger } from "@infrastructure/logging/logger";

const logger = createLogger("GET /api/dashboard");

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
 * GET /api/dashboard - Retrieve user's dashboard data
 *
 * Aggregates User, CareerGoal, and Roadmap data for the dashboard view.
 *
 * Query parameters:
 * - userId (required): User identifier
 *
 * Responses:
 * - 200: Dashboard data retrieved successfully
 * - 400: Missing or invalid userId
 * - 404: User not found
 * - 500: Internal server error
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiSuccessResponse<DashboardDTO> | ApiErrorResponse>> {
  try {
    // Parse and validate query parameters with Zod
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

    const { userId } = parseResult.data;

    // Get use case from DI container
    const getUserDashboard = dashboardContainer.getGetUserDashboardUseCase();

    // Execute use case
    const dashboardDTO = await getUserDashboard.execute(userId);

    // Handle case where user not found (use case throws error)
    if (!dashboardDTO) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Return success response
    const response: ApiSuccessResponse<DashboardDTO> = {
      success: true,
      data: dashboardDTO,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle "User not found" error from use case
    if (error instanceof Error && error.message === "User not found") {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Handle validation errors from domain entities
    if (
      error instanceof Error &&
      (error.message.includes("cannot be empty") ||
        error.message.includes("Invalid") ||
        error.message.includes("required"))
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
    logger.error("Unexpected error while fetching dashboard data", error, {
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
