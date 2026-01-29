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
 * Request body structure
 */
interface UpdateItemStatusRequest {
  roadmapId: string;
  status: "pending" | "in_progress" | "completed";
}

/**
 * Type guard to validate UpdateItemStatusRequest structure
 */
function isValidUpdateItemStatusRequest(
  body: unknown,
): body is UpdateItemStatusRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    "roadmapId" in body &&
    typeof (body as Record<string, unknown>).roadmapId === "string" &&
    "status" in body &&
    typeof (body as Record<string, unknown>).status === "string" &&
    ["pending", "in_progress", "completed"].includes(
      (body as Record<string, unknown>).status as string,
    )
  );
}

/**
 * PATCH /api/learning/roadmap/items/[itemId] - Update roadmap item status
 *
 * Path parameters:
 * - itemId: RoadmapItem identifier
 *
 * Request body:
 * {
 *   "roadmapId": string,
 *   "status": "pending" | "in_progress" | "completed"
 * }
 *
 * Responses:
 * - 200: Item status updated successfully, returns updated RoadmapDTO
 * - 400: Invalid request body or invalid status value
 * - 404: Roadmap or item not found
 * - 500: Internal server error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
): Promise<NextResponse<ApiSuccessResponse<RoadmapDTO> | ApiErrorResponse>> {
  try {
    const { itemId } = await params;

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
    if (!isValidUpdateItemStatusRequest(body)) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_REQUEST_BODY",
          message:
            "Request body must include 'roadmapId' and valid 'status' fields",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get use case from DI container
    const updateRoadmapItemStatus =
      learningContainer.getUpdateRoadmapItemStatusUseCase();

    // Execute use case
    const roadmapDTO: RoadmapDTO = await updateRoadmapItemStatus.execute({
      roadmapId: body.roadmapId,
      itemId,
      status: body.status,
    });

    // Return success response
    const response: ApiSuccessResponse<RoadmapDTO> = {
      success: true,
      data: roadmapDTO,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle "not found" errors
    if (error instanceof Error && error.message.includes("not found")) {
      const isItemNotFound =
        error.message.includes("RoadmapItem") ||
        (error.message.includes("Item") && !error.message.includes("Roadmap"));
      const code = isItemNotFound ? "ITEM_NOT_FOUND" : "ROADMAP_NOT_FOUND";

      const response: ApiErrorResponse = {
        success: false,
        error: {
          code,
          message: error.message,
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

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
    console.error(
      "Unexpected error in PATCH /api/learning/roadmap/items/[itemId]:",
      error,
    );
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
