import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { createLogger } from "@infrastructure/logging/logger";

const logger = createLogger("PATCH /api/learning/roadmap/items/[itemId]");

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
 * Zod schema for request body validation
 */
const UpdateItemStatusSchema = z.object({
  roadmapId: z.string().min(1, "roadmapId cannot be empty"),
  status: z.enum(["pending", "in_progress", "completed"], {
    message: "status must be one of: pending, in_progress, completed",
  }),
});

type UpdateItemStatusRequest = z.infer<typeof UpdateItemStatusSchema>;

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

    // Parse and validate request body with Zod
    let body: UpdateItemStatusRequest;
    try {
      const rawBody = await request.json();
      const parseResult = UpdateItemStatusSchema.safeParse(rawBody);

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

      body = parseResult.data;
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
    logger.error("Unexpected error while updating roadmap item status", error, {
      itemId: await params.then((p) => p.itemId),
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
