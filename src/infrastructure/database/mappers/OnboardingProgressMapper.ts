import {
  type OnboardingProgress as PrismaOnboardingProgress,
  type Prisma,
} from "@prisma/client";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";

/**
 * OnboardingProgressMapper - Infrastructure Mapper
 *
 * Converts between Prisma OnboardingProgress (persistence) and
 * Domain OnboardingSession (business logic).
 *
 * Handles JSON type conversion and step number to string conversion.
 *
 * @layer Infrastructure
 */
export class OnboardingProgressMapper {
  /**
   * Converts Prisma OnboardingProgress to Domain OnboardingSession
   *
   * @param prismaProgress - Prisma database model
   * @returns Domain entity
   */
  static toDomain(prismaProgress: PrismaOnboardingProgress): OnboardingSession {
    // Convert Prisma JsonValue to plain object
    const data = this.jsonValueToRecord(prismaProgress.partialData);

    return OnboardingSession.reconstitute(
      prismaProgress.userId,
      prismaProgress.currentStep,
      data,
      prismaProgress.lastUpdatedAt,
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
    currentStep: number;
    partialData: Prisma.InputJsonValue;
    lastUpdatedAt: Date;
  } {
    return {
      userId: session.userId,
      currentStep: session.currentStep,
      partialData: session.data as Prisma.InputJsonValue,
      lastUpdatedAt: session.updatedAt,
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
