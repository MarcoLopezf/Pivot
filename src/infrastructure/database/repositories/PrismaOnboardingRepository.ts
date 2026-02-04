import { type PrismaClient } from "@prisma/client";
import { IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";
import { OnboardingStateMapper } from "@infrastructure/database/mappers/OnboardingStateMapper";

/**
 * PrismaOnboardingRepository - Infrastructure Repository
 *
 * Concrete implementation of IOnboardingRepository using Prisma ORM.
 * Handles persistence and retrieval of onboarding session state.
 *
 * @layer Infrastructure
 */
export class PrismaOnboardingRepository implements IOnboardingRepository {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Persists an onboarding session
   *
   * Uses upsert to create or update the session
   */
  async save(session: OnboardingSession): Promise<void> {
    const data = OnboardingStateMapper.toPersistence(session);

    await this.db.onboardingState.upsert({
      where: { userId: session.userId },
      create: data,
      update: {
        currentStep: data.currentStep,
        data: data.data,
        updatedAt: data.updatedAt,
      },
    });
  }

  /**
   * Retrieves an onboarding session by user ID
   */
  async findByUserId(userId: string): Promise<OnboardingSession | null> {
    const prismaState = await this.db.onboardingState.findUnique({
      where: { userId },
    });

    if (!prismaState) {
      return null;
    }

    return OnboardingStateMapper.toDomain(prismaState);
  }

  /**
   * Deletes an onboarding session
   *
   * Used when onboarding is completed or needs to be reset
   */
  async delete(userId: string): Promise<void> {
    await this.db.onboardingState.delete({
      where: { userId },
    });
  }
}
