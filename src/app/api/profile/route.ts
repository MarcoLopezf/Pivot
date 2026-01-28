import { NextRequest, NextResponse } from "next/server";
import { profileContainer } from "@infrastructure/di/ProfileContainer";
import { UserAlreadyExistsError } from "@domain/profile/errors/UserAlreadyExistsError";
import { CreateUserDTO } from "@application/dtos/profile/CreateUserDTO";
import { UserDTO } from "@application/dtos/profile/UserDTO";

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
 * POST /api/profile - Create a new user profile
 *
 * Request body:
 * {
 *   "name": string,
 *   "email": string
 * }
 *
 * Responses:
 * - 201: User created successfully
 * - 400: Invalid request body or validation error
 * - 409: User with email already exists
 * - 500: Internal server error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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
    if (!isValidCreateUserDTO(body)) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_REQUEST_BODY",
          message: "Request body must include 'name' and 'email' fields",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get use case from DI container
    const createUserProfile = profileContainer.getCreateUserProfileUseCase();

    // Execute use case
    const userDTO: UserDTO = await createUserProfile.execute(body);

    // Return success response
    const response: ApiSuccessResponse<UserDTO> = {
      success: true,
      data: userDTO,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    // Handle domain-specific errors
    if (error instanceof UserAlreadyExistsError) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "USER_ALREADY_EXISTS",
          message: error.message,
        },
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Handle email validation errors from Email value object
    if (
      error instanceof Error &&
      error.message.includes("Invalid email format")
    ) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_EMAIL",
          message: error.message,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Handle unexpected errors
    console.error("Unexpected error in POST /api/profile:", error);
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
 * Type guard to validate CreateUserDTO structure
 */
function isValidCreateUserDTO(body: unknown): body is CreateUserDTO {
  return (
    typeof body === "object" &&
    body !== null &&
    "name" in body &&
    typeof (body as Record<string, unknown>).name === "string" &&
    "email" in body &&
    typeof (body as Record<string, unknown>).email === "string"
  );
}
