import { type IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";

/**
 * SaveOnboardingStep Use Case
 *
 * Saves the user's current onboarding progress to the database.
 * This allows users to resume their onboarding flow if they leave
 * and come back later.
 *
 * @layer Application
 */
export class SaveOnboardingStep {
  constructor(private readonly onboardingRepository: IOnboardingRepository) {}

  /**
   * Execute the use case
   *
   * @param userId - The user's unique identifier
   * @param step - The current step number (1-5)
   * @param data - Partial onboarding data collected so far
   * @returns Promise that resolves when saved successfully
   */
  async execute(
    userId: string,
    step: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // Validate inputs
    if (!userId || userId.trim() === "") {
      throw new Error("User ID is required");
    }

    if (step < 1 || step > 5) {
      throw new Error("Step must be between 1 and 5");
    }

    // Create or update onboarding session
    const session = OnboardingSession.create(userId, step, data);

    // Persist to database
    await this.onboardingRepository.save(session);
  }
}
