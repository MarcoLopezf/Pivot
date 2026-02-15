import { type PrismaClient } from "@prisma/client";
import { IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";
import { OnboardingProgressMapper } from "@infrastructure/database/mappers/OnboardingProgressMapper";

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
    const data = OnboardingProgressMapper.toPersistence(session);

    console.log("PrismaOnboardingRepository.save: Upserting session", {
      userId: session.userId,
      currentStep: data.currentStep,
      dataKeys: Object.keys(data.partialData),
    });

    await this.db.onboardingProgress.upsert({
      where: { userId: session.userId },
      create: {
        userId: data.userId,
        currentStep: data.currentStep,
        partialData: data.partialData,
        lastUpdatedAt: data.lastUpdatedAt,
      },
      update: {
        currentStep: data.currentStep,
        partialData: data.partialData,
        lastUpdatedAt: data.lastUpdatedAt,
      },
    });

    console.log("PrismaOnboardingRepository.save: Upsert completed");
  }

  /**
   * Retrieves an onboarding session by user ID
   */
  async findByUserId(userId: string): Promise<OnboardingSession | null> {
    console.log(
      "PrismaOnboardingRepository.findByUserId: Searching for userId:",
      userId,
    );

    const prismaProgress = await this.db.onboardingProgress.findUnique({
      where: { userId },
    });

    console.log(
      "PrismaOnboardingRepository.findByUserId: Result:",
      prismaProgress ? "FOUND" : "NOT FOUND",
    );

    if (prismaProgress) {
      console.log("PrismaOnboardingRepository.findByUserId: Found session", {
        currentStep: prismaProgress.currentStep,
        dataKeys: Object.keys(prismaProgress.partialData as object),
      });
    }

    if (!prismaProgress) {
      return null;
    }

    return OnboardingProgressMapper.toDomain(prismaProgress);
  }

  /**
   * Deletes an onboarding session
   *
   * Used when onboarding is completed or needs to be reset
   */
  async delete(userId: string): Promise<void> {
    await this.db.onboardingProgress.delete({
      where: { userId },
    });
  }
}
