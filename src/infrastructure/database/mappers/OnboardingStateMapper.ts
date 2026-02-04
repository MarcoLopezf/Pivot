import {
  type OnboardingState as PrismaOnboardingState,
  type Prisma,
} from "@prisma/client";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";

/**
 * OnboardingStateMapper - Infrastructure Mapper
 *
 * Converts between Prisma OnboardingState (persistence) and
 * Domain OnboardingSession (business logic).
 *
 * Handles JSON type conversion carefully to maintain type safety.
 *
 * @layer Infrastructure
 */
export class OnboardingStateMapper {
  /**
   * Converts Prisma OnboardingState to Domain OnboardingSession
   *
   * @param prismaState - Prisma database model
   * @returns Domain entity
   */
  static toDomain(prismaState: PrismaOnboardingState): OnboardingSession {
    // Convert Prisma JsonValue to plain object
    const data = this.jsonValueToRecord(prismaState.data);

    return OnboardingSession.reconstitute(
      prismaState.userId,
      prismaState.currentStep,
      data,
      prismaState.updatedAt,
    );
  }

  /**
   * Converts Domain OnboardingSession to Prisma persistence format
   *
   * @param session - Domain entity
   * @returns Prisma-compatible data structure
   */
  static toPersistence(session: OnboardingSession): {
    userId: string;
    currentStep: string;
    data: Prisma.InputJsonValue;
    updatedAt: Date;
  } {
    return {
      userId: session.userId,
      currentStep: session.currentStep,
      data: session.data as Prisma.InputJsonValue, // Safe cast: Record<string, unknown> is compatible with InputJsonValue
      updatedAt: session.updatedAt,
    };
  }

  /**
   * Safely converts Prisma JsonValue to Record<string, unknown>
   *
   * Handles edge cases and type validation
   *
   * @param jsonValue - Prisma JSON value
   * @returns Plain JavaScript object
   */
  private static jsonValueToRecord(
    jsonValue: Prisma.JsonValue,
  ): Record<string, unknown> {
    // JsonValue can be: string | number | boolean | null | JsonObject | JsonArray
    // We expect JsonObject for onboarding data

    if (jsonValue === null) {
      return {};
    }

    if (typeof jsonValue === "object" && !Array.isArray(jsonValue)) {
      // It's a JsonObject, safe to return
      return jsonValue as Record<string, unknown>;
    }

    // Unexpected type - return empty object
    console.warn(
      "Unexpected JsonValue type in OnboardingState:",
      typeof jsonValue,
    );
    return {};
  }
}
