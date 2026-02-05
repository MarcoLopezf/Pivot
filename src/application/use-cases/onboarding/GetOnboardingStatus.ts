import { type IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { type OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";

/**
 * GetOnboardingStatus Use Case
 *
 * Retrieves the user's current onboarding progress from the database.
 * Used to restore the onboarding state when a user returns to the flow.
 *
 * @layer Application
 */
export class GetOnboardingStatus {
  constructor(private readonly onboardingRepository: IOnboardingRepository) {}

  /**
   * Execute the use case
   *
   * @param userId - The user's unique identifier
   * @returns The onboarding session if found, null otherwise
   */
  async execute(userId: string): Promise<OnboardingSession | null> {
    // Validate input
    if (!userId || userId.trim() === "") {
      throw new Error("User ID is required");
    }

    // Fetch from repository
    const session = await this.onboardingRepository.findByUserId(userId);

    return session;
  }
}
